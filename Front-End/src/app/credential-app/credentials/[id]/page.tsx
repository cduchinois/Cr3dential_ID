'use client';

import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';

import CredentialDetail from '@/components/Credentials/CredentialDetail';
import { StoredCredential } from '@/types/credential';

function CredentialDetailPage({ params }: { params: { id: string } }) {
  const [credential, setCredential] = useState<StoredCredential | null>(null);

  useEffect(() => {
    // Fetch credentials from localStorage
    const storedCredentials = JSON.parse(
      localStorage.getItem('credentials') || '[]'
    ) as StoredCredential[];

    // Find the specific credential by ID
    const foundCredential = storedCredentials.find((c) => c.id === params.id);
    setCredential(foundCredential || null);
  }, [params.id]);

  if (!credential) {
    return (
      <Stack
        sx={{
          color: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
        }}
      >
        Credential not found
      </Stack>
    );
  }

  return <CredentialDetail credential={credential} />;
}

export default CredentialDetailPage;
