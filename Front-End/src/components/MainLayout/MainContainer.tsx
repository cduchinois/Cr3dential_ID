'use client';

import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface MainContainerProps {
  children: ReactNode;
}

export default function MainContainer({ children }: MainContainerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        pt: isMobile ? '56px' : '64px', // Adjust top padding based on mobile/desktop
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 3 }}>
        {children}
      </Container>
    </Box>
  );
}
