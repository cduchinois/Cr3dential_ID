import { Typography, Box } from '@mui/material';
import Link from 'next/link';

interface TabIconProps {
  redirectTo: string;
  icon: React.ReactNode;
  label: string;
  hideLabel?: boolean;
}

function TabIcon({ redirectTo, icon, label, hideLabel = false }: TabIconProps) {
  return (
    <Link
      href={redirectTo}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      <Box sx={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </Box>
      {!hideLabel && (
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      )}
    </Link>
  );
}

export default TabIcon;
