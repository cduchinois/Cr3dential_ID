'use client';

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Box, Typography } from '@mui/material';

export default function ScanPage() {
  const [data, setData] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        setData(result.data);
        console.log('Scanned data:', result.data);
        // Handle the QR code data here
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
  }, []);

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

      {data && (
        <Typography sx={{ mt: 2 }}>
          Scanned Result: {data}
        </Typography>
      )}
    </Box>
  );
}