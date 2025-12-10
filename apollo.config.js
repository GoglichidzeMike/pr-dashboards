module.exports = {
  client: {
    service: {
      name: 'github',
      url: 'https://api.github.com/graphql',
    },
    includes: ['./src/lib/github/**/*.{ts,tsx}'],
    excludes: ['**/node_modules/**', '**/__tests__/**'],
  },
};

