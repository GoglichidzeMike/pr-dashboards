#!/usr/bin/env node

/**
 * Script to download GitHub GraphQL schema via introspection
 * Requires GITHUB_TOKEN environment variable
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, '..', 'github-schema.graphql');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required');
  console.log('Please set GITHUB_TOKEN and run again, or manually download the schema');
  console.log('You can get a token from: https://github.com/settings/tokens');
  process.exit(1);
}

const introspectionQuery = JSON.stringify({
  query: `
    query IntrospectionQuery {
      __schema {
        queryType { name }
        mutationType { name }
        subscriptionType { name }
        types {
          ...FullType
        }
        directives {
          name
          description
          locations
          args {
            ...InputValue
          }
        }
      }
    }
    fragment FullType on __Type {
      kind
      name
      description
      fields(includeDeprecated: true) {
        name
        description
        args {
          ...InputValue
        }
        type {
          ...TypeRef
        }
        isDeprecated
        deprecationReason
      }
      inputFields {
        ...InputValue
      }
      interfaces {
        ...TypeRef
      }
      enumValues(includeDeprecated: true) {
        name
        description
        isDeprecated
        deprecationReason
      }
      possibleTypes {
        ...TypeRef
      }
    }
    fragment InputValue on __InputValue {
      name
      description
      type { ...TypeRef }
      defaultValue
    }
    fragment TypeRef on __Type {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  `
});

const options = {
  hostname: 'api.github.com',
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'User-Agent': 'GitHub-PR-Dashboard',
    'Content-Length': Buffer.byteLength(introspectionQuery)
  }
};

console.log('Downloading GitHub GraphQL schema via introspection...');

const req = https.request(options, (response) => {
  let data = '';

  response.on('data', (chunk) => {
    data += chunk;
  });

  response.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.errors) {
        console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
        process.exit(1);
      }
      
      // Convert introspection result to SDL format
      // For now, we'll save the JSON and codegen can use it
      // Actually, codegen can use JSON introspection directly
      fs.writeFileSync(SCHEMA_PATH, JSON.stringify(result.data, null, 2));
      console.log(`Schema downloaded to ${SCHEMA_PATH}`);
      console.log('Note: Using JSON introspection format. Codegen will handle this.');
    } catch (error) {
      console.error(`Error parsing response: ${error.message}`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error(`Error downloading schema: ${error.message}`);
  process.exit(1);
});

req.write(introspectionQuery);
req.end();

