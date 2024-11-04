'use client';

import { Alert,Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import QrScanner from 'qr-scanner';
import { useEffect, useRef, useState } from 'react';

export default function ScanPage() {
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [_, setQrScanner] = useState<QrScanner | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        try {
          const url = new URL(result.data);

          // Check if the URL path starts with /credential-request
          if (!url.pathname.startsWith('/credential-app/credential-offer')) {
            setError('Invalid credential request QR code');
            return;
          }

          // Valid URL with correct path - navigate to the credential offer page
          router.push(url.pathname + url.search);
        } catch (err) {
          setError('Invalid QR code: Please scan a valid URL');
        }
      },
      {
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    setQrScanner(scanner);
    scanner.start();

    return () => {
      scanner.destroy();
    };
  }, [router]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        p: 2
      }}
    >
      <Typography variant="h6" gutterBottom>
        Scan QR Code
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          flex: 1,
          position: 'relative',
          width: '100%',
          '& video': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }
        }}
      >
        <video ref={videoRef} />
      </Box>
    </Box>
  );
}