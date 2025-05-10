'use client';

import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';

import CredentialCard from '@/components/Credentials/CredentialCard';

import { StoredCredential } from '@/types/credential';

function CredentialsPage() {
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);

  useEffect(() => {
    // Load credentials from localStorage
    const storedCredentials = JSON.parse(
      localStorage.getItem('credentials') || '[]'
    ) as StoredCredential[];

    // Enhance credentials with images based on their type
    const enhancedCredentials = storedCredentials.map((credential) => ({
      ...credential,
      image:
        credential.image ??
        'data:image/png;base64,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',
    }));

    setCredentials(enhancedCredentials);
  }, []);

  if (credentials.length === 0) {
    return (
      <Stack
        gap={2}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          color: '#fff',
        }}
      >
        No credentials found
      </Stack>
    );
  }

  return (
    <Stack gap={2}>
      {credentials.map((credential) => (
        <CredentialCard key={credential.id} credential={credential} />
      ))}
    </Stack>
  );
}

export default CredentialsPage;
