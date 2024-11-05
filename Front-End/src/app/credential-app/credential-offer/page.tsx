'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import Image, { StaticImageData } from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useWeb3Auth } from '@/hooks/useWeb3Auth';

// import { xrplProvider } from '../../../lib/web3Auth';

import { StoredCredential } from '@/types/credential';
import { StoredDIDDocument } from '@/types/did';

/**
 * Represents a credential offer with its properties
 * @property id - Unique identifier for the credential offer
 * @property type - The type of credential being offered
 * @property typeLabel - Optional display label for the credential type
 * @property image - Optional image URL associated with the credential
 * @property issuer - The DID of the credential issuer
 * @property holder - The DID of the intended credential holder
 * @property issuanceDate - Date when the credential was/will be issued
 * @property expirationDate - Date when the credential will expire
 * @property status - Current status of the credential offer
 * @property fields - Key-value pairs of additional credential fields
 */
export interface CredentialOffer {
  id: string;
  type: string;
  issuer: string;
  credentialSchema: {
    id: string;
    type: string;
  }[];
  credentialSubject: Record<string, string>;
  validFrom: string;
  validUntil?: string;
  status: string;
  image?: string | StaticImageData;
}

export default function CredentialRequestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userWallet } = useWeb3Auth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [credentialOffer, setCredentialOffer] =
    useState<CredentialOffer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const type = searchParams.get('type');
    if (!type) {
      setError('Missing credential type');
      setLoading(false);
      return;
    }

    // TODO: Get these values from your authentication context
    const did = localStorage.getItem(`did`) || '';
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

  const handleAccept = async () => {
    try {
      setIsProcessing(true);

      const challenge = `${credentialOffer?.id}-${crypto.randomUUID()}`;
      const signature = 'test'; //await xrplProvider?.signMessage(challenge);
      const did = localStorage.getItem(`did`) || '';

      const response = await fetch('/api/credentials/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentialOffer,
          challenge,
          signature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept credential offer');
      }

      // Generate a unique ID for the credential
      const credentialId = crypto.randomUUID();
      const storedCredential = {
        ...data.credential,
        id: credentialId,
      };

      // Store credential
      const existingCredentials = JSON.parse(
        localStorage.getItem('credentials') || '[]'
      ) as StoredCredential[];
      existingCredentials.push(storedCredential);
      localStorage.setItem('credentials', JSON.stringify(existingCredentials));

      // Store or update DID Document with credential link
      const existingDIDDocs = JSON.parse(
        localStorage.getItem('didDocuments') || '{}'
      ) as Record<string, StoredDIDDocument>;

      if (!existingDIDDocs[did]) {
        // Create new DID Document if it doesn't exist
        existingDIDDocs[did] = {
          '@context': ['https://www.w3.org/ns/did/v1'],
          id: did,
          controller: did,
          verificationMethod: [
            {
              id: `${did}#keys-1`,
              type: 'EcdsaSecp256k1VerificationKey2019',
              controller: did,
              publicKeyMultibase: 'test-public-key', // This would come from web3auth in real implementation
            },
          ],
          authentication: [`${did}#keys-1`],
          assertionMethod: [`${did}#keys-1`],
          service: [
            {
              id: `${did}#credential-service`,
              type: 'CredentialService',
              serviceEndpoint: data.didDocumentUrl,
            },
          ],
          linkedCredentials: [credentialId],
        };
      } else {
        // Add credential ID to existing DID Document's linked credentials
        existingDIDDocs[did].linkedCredentials = [
          ...new Set([...existingDIDDocs[did].linkedCredentials, credentialId]),
        ];
      }

      localStorage.setItem('didDocuments', JSON.stringify(existingDIDDocs));

      toast.success('Credential has been created and linked successfully');
      router.push('/credential-app/credentials');
    } catch (error) {
      console.error('Error accepting credential offer:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to accept credential offer'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = () => {
    router.push('/credential-app/credentials');
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

  const issuerDetails = (credentialOffer: CredentialOffer) => {
    const details = [
      { label: 'Type', value: credentialOffer.type },
      { label: 'Issuer', value: credentialOffer.issuer },
      {
        label: 'Issue Date',
        value: formatDate(credentialOffer.validFrom),
      },
    ];
    if (credentialOffer.validUntil) {
      details.push({
        label: 'Expiration Date',
        value: formatDate(credentialOffer.validUntil),
      });
    }
    return details;
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
          position: 'relative',
        }}
      >
        {credentialOffer.image && (
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <Image
              src={credentialOffer.image}
              alt="Credential issuer logo"
              width={42}
              height={42}
              style={{
                borderRadius: '4px',
                objectFit: 'contain'
              }}
            />
          </Box>
        )}
        <CardContent>
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant='h6'
                sx={{
                  color: '#fff',
                  fontWeight: 500,
                }}
              >
                Issuer Details
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gap: 2 }}>
              {issuerDetails(credentialOffer).map(({ label, value }) => (
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
            Content
          </Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            {Object.entries(credentialOffer.credentialSubject).filter(
              ([key]) => key !== 'did'
            ).map(([key, value]) => (
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
                {credentialOffer.credentialSubject.did}
              </Typography>
            </Box>
          </Stack>
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
          variant='outlined'
          size='large'
          onClick={handleDecline}
          disabled={isProcessing}
          sx={{
            minWidth: '120px',
            backgroundColor: 'transparent',
            color: '#ff5252',
            backdropFilter: 'blur(10px)',
            border: '1px solid #ff5252',
            '&:hover': {
              backgroundColor: 'rgba(255, 82, 82, 0.15)',
              borderColor: '#ff1744',
              color: '#ff1744',
            },
          }}
        >
          Decline
        </Button>
        <Button
          variant='contained'
          size='large'
          onClick={handleAccept}
          disabled={isProcessing}
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
          {isProcessing ? 'Processing...' : 'Accept'}
        </Button>
      </Box>
    </Box>
  );
}
