import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
} from '@mui/material';
import { useRouter } from 'next/navigation';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const router = useRouter();

  const menuItems = [
    { text: 'Home', path: '/credential-app' },
    { text: 'Profile', path: '/credential-app/profile' },
    { text: 'Credentials', path: '/credential-app/credentials' },
    { text: 'Admin', path: '/credential-app/admin' },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: '250px' }
      }}
    >
      <Stack spacing={2} sx={{ p: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleNavigation(item.path)}>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Stack>
    </Drawer>
  );
} 