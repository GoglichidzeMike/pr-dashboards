import { useEffect, useState } from 'react';

export const usePRFileUrl = (filePath: string, prUrl: string): string => {
  const [fileUrl, setFileUrl] = useState<string>('');

  useEffect(() => {
    if (!filePath || !prUrl) return;
    
    const generateUrl = async () => {
      const encoder = new TextEncoder();
      const data = encoder.encode(filePath);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const baseUrl = prUrl.replace(/\/pull\/\d+$/, '');
      const prNumber = prUrl.match(/\/pull\/(\d+)/)?.[1] || '';
      setFileUrl(`${baseUrl}/pull/${prNumber}/changes#diff-${hashHex}`);
    };
    generateUrl();
  }, [filePath, prUrl]);

  return fileUrl;
};