'use client';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import Image from 'next/image';

import { StoredCredential } from '@/types/credential';
import CredentialFields from './CredentialFields';

interface CredentialDetailProps {
  credential: StoredCredential;
}

function CredentialDetail({ credential }: CredentialDetailProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4caf50';
      case 'revoked':
        return '#f44336';
      case 'expired':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ p: 2, maxWidth: '800px', margin: '0 auto' }}>
      <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 3 }}>
        <Typography
          variant='h5'
          sx={{
            color: '#fff',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            fontWeight: 600,
            flexGrow: 1,
          }}
        >
          {credential.type[credential.type.length - 1]}
        </Typography>
        <Chip
          label={credential.status.toUpperCase()}
          sx={{
            backgroundColor: getStatusColor(credential.status),
            color: '#fff',
          }}
        />
      </Stack>

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
            sx={{ color: '#fff', fontWeight: 500 }}
          >
            Credential Information
          </Typography>
          <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          <CredentialFields
            type={credential.type[credential.type.length - 1]}
            fields={credential.credentialSubject}
          />
        </CardContent>
      </Card>

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
            sx={{ color: '#fff', fontWeight: 500 }}
          >
            Issuer Details
          </Typography>
          <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          <Stack spacing={3} alignItems='center'>
            <Box
              sx={{
                backgroundColor: '#fff',
                width: '150px',
                height: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
              }}
            >
              <Image
                src={credential.image || '/images/default-credential.png'}
                alt={credential.type[credential.type.length - 1]}
                width={150}
                height={150}
                style={{
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
            </Box>
            <Stack spacing={2} sx={{ width: '100%' }}>
              <Box>
                <Typography
                  variant='subtitle2'
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}
                >
                  Issuer
                </Typography>
                <Typography sx={{ color: '#fff' }}>
                  {credential.issuer}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant='subtitle2'
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}
                >
                  Issuance Date
                </Typography>
                <Typography sx={{ color: '#fff' }}>
                  {formatDate(credential.issuanceDate)}
                </Typography>
              </Box>
              {credential.proof && (
                <Box>
                  <Typography
                    variant='subtitle2'
                    sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}
                  >
                    Proof Type
                  </Typography>
                  <Typography sx={{ color: '#fff' }}>
                    {credential.proof.type}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

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
            sx={{ color: '#fff', fontWeight: 500 }}
          >
            User Details
          </Typography>
          <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          <Stack spacing={2}>
            <Box>
              <Typography
                variant='subtitle2'
                sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}
              >
                DID
              </Typography>
              <Typography
                sx={{
                  color: '#fff',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  p: 1.5,
                  borderRadius: 1,
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}
              >
                {credential.credentialSubject.id}
              </Typography>
            </Box>
            {credential.proof && (
              <Box>
                <Typography
                  variant='subtitle2'
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}
                >
                  Verification Method
                </Typography>
                <Typography
                  sx={{
                    color: '#fff',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    p: 1.5,
                    borderRadius: 1,
                    fontSize: '0.95rem',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                  }}
                >
                  {credential.proof.verificationMethod}
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default CredentialDetail;
