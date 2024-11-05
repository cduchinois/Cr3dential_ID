'use client';

import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import TopBar from '@/components/MainLayout/TopBar';
import MainContainer from '@/components/MainLayout/MainContainer';
import theme from '@/styles/theme';

export default function CredentialAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar />
        <MainContainer>{children}</MainContainer>
      </Box>
    </ThemeProvider>
  );
}
