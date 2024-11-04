'use client';
import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Link,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import bs58 from 'bs58';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';

export default function ClaimDID() {
  const { userWallet, createDid } = useWeb3Auth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [didUri, setDidUri] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [copyTooltip, setCopyTooltip] = useState('Copy');

  const truncateAddress = (text: string, startLength = 4, endLength = 8) => {
    if (!text) return '';
    // Remove the prefix if it exists
    const address = text.replace('did:xrpl:1:', '');
    if (address.length <= startLength + endLength) return address;
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyTooltip('Copied!');
    setTimeout(() => setCopyTooltip('Copy'), 2000);
  };

  const handleClaimDID = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      setDidUri(null);

      if (!userWallet?.address) {
        throw new Error('Wallet not connected');
      }

      console.log('Starting DID creation process with wallet:', userWallet.address);

      // Create DID Document following the structure in DID-back.ts
      const did = `did:xrpl:1:${userWallet.address}`;
      console.log('Generated DID:', did);

      const didDocument = {
        '@context': 'https://www.w3.org/ns/did/v1',
        id: did,
        controller: did,
        verificationMethod: [
          {
            id: `${did}#keys-1`,
            type: 'EcdsaSecp256k1RecoveryMethod2020',
            controller: did,
            publicKeyHex: userWallet.address,
          },
        ],
      };

      console.log('Created DID Document:', JSON.stringify(didDocument, null, 2));

      // Convert to string and create IPFS hash
      const didDocumentString = JSON.stringify(didDocument);
      console.log('DID Document string:', didDocumentString);

      // Create a base58-encoded string that can be decoded
      const bytes = Buffer.from(didDocumentString, 'utf8');
      const base58String = bs58.encode(bytes);
      console.log('Base58 encoded string:', base58String);

      // Test that it can be decoded
      const decodedTest = bs58.decode(base58String);
      const decodedString = Buffer.from(decodedTest).toString('utf8');
      console.log('Decoded test:', decodedString);

      console.log('Calling createDid with:', {
        address: userWallet.address,
        base58String: base58String
      });

      const result = await createDid(userWallet.address, base58String);
      console.log('CreateDid result:', result);

      if (result?.success) {
        setSuccess(true);
        setDidUri(did);
        setExplorerUrl(result.explorerUrl);
        console.log('DID created successfully:', {
          did: did,
          result: result,
          explorerUrl: result.explorerUrl
        });
      } else {
        console.error('CreateDid returned unsuccessful result:', result);
        throw new Error(result?.error || 'Failed to create DID');
      }
    } catch (err) {
      console.error('Error in handleClaimDID:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      setError(err instanceof Error ? err.message : 'Failed to claim DID');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontSize: '1rem' }}
      >
        My DID
      </Typography>

      <Box sx={{ mt: 2 }}>
        {!success ? (
          <Button
            variant="contained"
            onClick={handleClaimDID}
            disabled={loading}
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: 1.5,
              px: 3,
              py: 0.75,
              fontSize: '0.875rem'
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Creating DID...
              </>
            ) : (
              'Claim'
            )}
          </Button>
        ) : (
          <Box sx={{ mt: 1 }}>
            {/* DID Display */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1.5,
                maxWidth: '100%'
              }}
            >
              <Chip
                label="DID"
                size="small"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontWeight: 500,
                  height: 20,
                  flexShrink: 0,
                  '& .MuiChip-label': {
                    px: 1,
                    fontSize: '0.75rem'
                  }
                }}
              />
              <Tooltip title={didUri || ''}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    color: 'text.secondary',
                    fontSize: '0.8rem',
                    flexGrow: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{ color: 'text.primary' }}>did:xrpl:1:</span>
                  {truncateAddress(didUri || '')}
                </Typography>
              </Tooltip>
              <Tooltip title={copyTooltip}>
                <IconButton
                  size="small"
                  onClick={() => handleCopy(didUri || '')}
                  sx={{
                    ml: 'auto',
                    p: 0.5,
                    flexShrink: 0
                  }}
                >
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                color="success.main"
                sx={{ fontSize: '0.8rem' }}
              >
                DID created successfully!
              </Typography>
              {explorerUrl && (
                <Link
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    ml: 'auto',
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  <LaunchIcon sx={{ fontSize: 14 }} />
                  View transaction on-chain
                </Link>
              )}
            </Box>
          </Box>
        )}

        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{
              mt: 1.5,
              borderRadius: 1.5,
              py: 0.75,
              '& .MuiAlert-message': {
                padding: 0
              }
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontSize: '0.8rem' }}
            >
              Error: {error}
            </Typography>
            <Typography
              variant="caption"
              component="div"
              sx={{
                mt: 0.5,
                fontSize: '0.75rem'
              }}
            >
              Please check the console for more details.
            </Typography>
          </Alert>
        )}
      </Box>
    </Box>
  );
}