'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
  useTheme,
} from '@mui/material';
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
  const theme = useTheme();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [credentialOffer, setCredentialOffer] =
    useState<CredentialOffer | null>(null);

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
        <CircularProgress sx={{ color: '#fff' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity='error'
          sx={{
            backgroundColor: 'rgba(211, 47, 47, 0.15)',
            color: '#fff',
            '& .MuiAlert-icon': {
              color: '#fff',
            },
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!credentialOffer) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ p: 2, maxWidth: '800px', margin: '0 auto' }}>
      <Typography
        variant='h5'
        gutterBottom
        sx={{
          color: '#fff',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontWeight: 600,
        }}
      >
        Credential Offer
      </Typography>

      <Card
        sx={{
          mb: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <CardContent>
          <Typography
            variant='h6'
            gutterBottom
            sx={{
              color: '#fff',
              fontWeight: 500,
            }}
          >
            Credential Details
          </Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            {[
              { label: 'Type', value: credentialOffer.type },
              { label: 'Issuer', value: credentialOffer.issuer },
              {
                label: 'Issue Date',
                value: formatDate(credentialOffer.issuanceDate),
              },
              {
                label: 'Expiration Date',
                value: formatDate(credentialOffer.expirationDate),
              },
            ].map(({ label, value }) => (
              <Box key={label}>
                <Typography
                  variant='subtitle2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 0.5,
                    fontWeight: 500,
                  }}
                >
                  {label}
                </Typography>
                <Typography sx={{ color: '#fff' }}>{value}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card
        sx={{
          mb: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <CardContent>
          <Typography
            variant='h6'
            gutterBottom
            sx={{
              color: '#fff',
              fontWeight: 500,
            }}
          >
            Credential Content
          </Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            {Object.entries(credentialOffer.fields).map(([key, value]) => (
              <Box key={key}>
                <Typography
                  variant='subtitle2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 0.5,
                    fontWeight: 500,
                  }}
                >
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                </Typography>
                <Typography sx={{ color: '#fff' }}>{value}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Divider
        sx={{
          my: 3,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}
      />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant='contained'
          size='large'
          onClick={handleAccept}
          sx={{
            minWidth: '120px',
            backgroundColor: '#4caf50',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: '#45a049',
            },
          }}
        >
          Accept
        </Button>
        <Button
          variant='outlined'
          size='large'
          onClick={handleDecline}
          sx={{
            minWidth: '120px',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            color: '#fff',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.8)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Decline
        </Button>
      </Box>
    </Box>
  );
}
