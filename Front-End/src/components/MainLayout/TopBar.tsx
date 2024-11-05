import { AppBar, Box, IconButton, Stack, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Image from 'next/image';
import { Menu as MenuIcon } from 'lucide-react';
import { useState } from 'react';
import MobileMenu from './MobileMenu';

export default function TopBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AppBar position="fixed" sx={{ backgroundColor: 'white' }}>
      <Toolbar>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Box sx={{ height: '50px', position: 'relative', width: '150px' }}>
            <Image
              src="/logo_cr3dential.png"
              alt="Cr3dential Logo"
              fill
              style={{ objectFit: 'contain' }}
            />
          </Box>

          {isMobile ? (
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon color="black" />
            </IconButton>
          ) : (
            <Stack direction="row" spacing={2}>
              {/* Your existing navigation items */}
            </Stack>
          )}
        </Stack>
      </Toolbar>
      
      <MobileMenu 
        open={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
    </AppBar>
  );
}
