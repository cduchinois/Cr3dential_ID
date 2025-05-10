'use client';

import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import theme from '@/styles/theme';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </ThemeProvider>
  );
} 