'use client';

import { Alert, Box, Button, CircularProgress,Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CredentialOffer {
  type: string;
  issuer: string;
  holder: string;
  issuanceDate: string;
  expirationDate: string;
  status: string;
  fields: Record<string, any>;
}

export default function CredentialRequestPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [credentialOffer, setCredentialOffer] = useState<CredentialOffer | null>(null);

  useEffect(() => {
    const type = searchParams.get('type');
    if (!type) {
      setError('Missing credential type');
      setLoading(false);
      return;
    }

    // TODO: Get these values from your authentication context
    const did = 'user-did';
    const email = 'user@example.com';

    fetch('/api/credentials/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ did, email, type }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setCredentialOffer(data.credentialOffer);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  const handleAccept = () => {
    // TODO: Implement accept logic
    console.log('Accepting credential offer');
  };

  const handleDecline = () => {
    // TODO: Implement decline logic
    console.log('Declining credential offer');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!credentialOffer) {
    return null;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Credential Offer
      </Typography>

      <Box sx={{ my: 2 }}>
        <Typography variant="body1">Type: {credentialOffer.type}</Typography>
        <Typography variant="body1">Issuer: {credentialOffer.issuer}</Typography>
        <Typography variant="body1">Valid Until: {new Date(credentialOffer.expirationDate).toLocaleDateString()}</Typography>
      </Box>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleAccept}>
          Accept
        </Button>
        <Button variant="outlined" color="error" onClick={handleDecline}>
          Decline
        </Button>
      </Box>
    </Box>
  );
}