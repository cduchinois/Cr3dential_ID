'use client';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  SelectChangeEvent,
  Divider 
} from '@mui/material';
import LoginButton from '@/components/Web3Auth/LoginButton';
import Balance from '@/components/Web3Auth/Balance';
import ClaimDID from '@/components/DID/ClaimDID';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { useState, useEffect } from 'react';
import { NetworkType, getCurrentNetwork, setCurrentNetwork } from '@/lib/networkConfig';

export default function ProfilePage() {
  const { isLogged, userWallet, needsFunding } = useWeb3Auth();
  const [network, setNetwork] = useState<NetworkType>(getCurrentNetwork());

  const getWalletStatus = () => {
    if (!isLogged) return 'Not Connected';
    if (needsFunding) return 'Funding...';
    return 'Active';
  };

  const handleNetworkChange = (event: SelectChangeEvent) => {
    const newNetwork = event.target.value as NetworkType;
    setNetwork(newNetwork);
    setCurrentNetwork(newNetwork);
    // Trigger a balance refresh
    const balanceEvent = new CustomEvent('balanceUpdated');
    window.dispatchEvent(balanceEvent);
  };

  // Initialize network on component mount
  useEffect(() => {
    setNetwork(getCurrentNetwork());
  }, []);

  return (
    <Container maxWidth="sm">
      <Paper 
        sx={{ 
          p: 3, 
          mt: 2
        }}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Wallet Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LoginButton />
              <Typography 
                variant="body2" 
                color={getWalletStatus() === 'Active' ? 'success.main' : 'warning.main'}
              >
                Status: {getWalletStatus()}
              </Typography>
            </Box>

            {isLogged && userWallet && (
              <>
                <FormControl size="small" sx={{ maxWidth: 200 }}>
                  <InputLabel>Network</InputLabel>
                  <Select
                    value={network}
                    label="Network"
                    onChange={handleNetworkChange}
                  >
                    <MenuItem value="testnet">XRPL Testnet</MenuItem>
                    <MenuItem value="devnet">XRPL Devnet</MenuItem>
                    <MenuItem value="mainnet">XRPL Mainnet</MenuItem>
                  </Select>
                </FormControl>

                <Balance />
              </>
            )}
          </Box>
        </Box>

        {isLogged && userWallet && (
          <>
            <Divider sx={{ my: 2 }} />
            <ClaimDID />
          </>
        )}
      </Paper>
    </Container>
  );
}
