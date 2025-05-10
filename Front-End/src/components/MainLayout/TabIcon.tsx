import { Typography, Box } from '@mui/material';
import Link from 'next/link';

interface TabIconProps {
  redirectTo: string;
  icon: React.ReactNode;
  label: string;
  hideLabel?: boolean;
  active?: boolean;
}

function TabIcon({ redirectTo, icon, label, hideLabel = false, active = false }: TabIconProps) {
  return (
    <Link
      href={redirectTo}
      style={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      <Box
        sx={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& svg': {
            color: active ? '#fff' : '#ccc',
          }
        }}
      >
        {icon}
      </Box>
      {!hideLabel && (
        <Typography
          variant="caption"
          sx={{
            color: active ? '#fff' : '#ccc',
            transition: 'color 0.2s ease'
          }}
        >
          {label}
        </Typography>
      )}
    </Link>
  );
}

export default TabIcon;
