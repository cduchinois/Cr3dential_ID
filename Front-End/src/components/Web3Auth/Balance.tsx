'use client';
import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import XrplRPC from '@/lib/xrpl-rpc';

export default function Balance() {
  const { provider, isLogged } = useWeb3Auth();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (isLogged && provider) {
      try {
        setLoading(true);
        const xrplRPC = new XrplRPC(provider);
        const balanceResult = await xrplRPC.getBalance();
        setBalance(balanceResult);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        setBalance('0');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const handleBalanceUpdate = () => {
      fetchBalance();
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    fetchBalance();

    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
    };
  }, [isLogged, provider]);

  if (!isLogged) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography 
        variant="subtitle1"
        sx={{ 
          fontSize: '0.9rem',
          fontWeight: 500
        }}
      >
        Balance: {loading ? <CircularProgress size={14} /> : `${balance} XRP`}
      </Typography>
      <IconButton 
        onClick={fetchBalance} 
        size="small"
        disabled={loading}
        sx={{ 
          p: 0.5,
          '& .MuiSvgIcon-root': {
            fontSize: '1rem'
          }
        }}
      >
        <RefreshIcon />
      </IconButton>
    </Box>
  );
} 