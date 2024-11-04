import ChecklistIcon from '@mui/icons-material/Checklist';
import PersonIcon from '@mui/icons-material/Person';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { Stack, Box } from '@mui/material';

import TabIcon from './TabIcon';

function Navbar() {
  return (
    <Stack
      direction='row'
      justifyContent='space-around'
      alignItems='center'
      justifySelf='flex-end'
      p={2}
    >
      <TabIcon
        redirectTo='/credential-app/credentials'
        icon={<ChecklistIcon sx={{ fontSize: 28 }} />}
        label='Credentials'
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box
          sx={{
            backgroundColor: 'black',
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: '4px'
          }}
        >
          <TabIcon
            redirectTo='/credential-app/scan'
            icon={<QrCodeScannerIcon sx={{ color: 'white', fontSize: 28 }} />}
            label='Scan'
            hideLabel
          />
        </Box>
        <Box sx={{ typography: 'caption', color: 'text.secondary' }}>Scan</Box>
      </Box>
      <TabIcon
        redirectTo='/credential-app/profile'
        icon={<PersonIcon sx={{ fontSize: 28 }} />}
        label='Profile'
      />
    </Stack>
  );
}

export default Navbar;
