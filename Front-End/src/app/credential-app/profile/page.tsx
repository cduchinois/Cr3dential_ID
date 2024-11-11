'use client';
import {
  Box,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import {
  getCurrentNetwork,
  NetworkType,
  setCurrentNetwork,
} from '@/lib/networkConfig';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';

import ClaimDID from '@/components/DID/ClaimDID';
import Balance from '@/components/Web3Auth/Balance';
import LoginButton from '@/components/Web3Auth/LoginButton';
import TransferXRP from '@/components/Web3Auth/TransferXRP';

export default function ProfilePage() {
  const { isLogged, userWallet, needsFunding, getDid } = useWeb3Auth();
  const [network, setNetwork] = useState<NetworkType>(getCurrentNetwork());
  const [did, setDid] = useState<string | null>(null);

  const getWalletStatus = () => {
    if (!isLogged) return 'Not Connected';
    if (needsFunding) return 'Funding...';
    return 'Active';
  };

  const handleNetworkChange = (event: SelectChangeEvent) => {
    const newNetwork = event.target.value as NetworkType;
    setNetwork(newNetwork);
    setCurrentNetwork(newNetwork);
    if (typeof window !== 'undefined') {
      localStorage.setItem("network", newNetwork);
    }
    // Trigger a balance refresh
    const balanceEvent = new CustomEvent("balanceUpdated");
    window.dispatchEvent(balanceEvent);
  };

  // Initialize network on component mount
  useEffect(() => {
    setNetwork(getCurrentNetwork());
  }, []);

  // Check for existing DID when wallet is connected
  useEffect(() => {
    const checkDid = async () => {
      if (isLogged && userWallet?.address) {
        const did = await getDid(userWallet.address);
        if (did) {
          localStorage.setItem(`did`, did);
          setDid(did);
        } else {
          setDid(null);
        }
      }
    };
    checkDid();
  }, [isLogged, userWallet, getDid]);

  return (
    <Container maxWidth='sm'>
      <Paper
        sx={{
          p: 3,
          mt: 2,
        }}
      >
        <Box>
          <Typography variant='h6' gutterBottom>
            Wallet Information
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LoginButton />
              <Typography
                variant='body2'
                color={
                  getWalletStatus() === 'Active'
                    ? 'success.main'
                    : 'warning.main'
                }
              >
                Status: {getWalletStatus()}
              </Typography>
            </Box>

            {isLogged && userWallet && (
              <>
                <FormControl size='small' sx={{ maxWidth: 200 }}>
                  <InputLabel>Network</InputLabel>
                  <Select
                    value={network}
                    label='Network'
                    onChange={handleNetworkChange}
                  >
                    <MenuItem value='mainnet'>XRPL Mainnet</MenuItem>
                    <MenuItem value='testnet'>XRPL Testnet</MenuItem>
                    <MenuItem value='devnet'>XRPL Devnet</MenuItem>
                  </Select>
                </FormControl>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    width: '100%',
                  }}
                >
                  <Balance />
                  <TransferXRP />
                </Box>
              </>
            )}
          </Box>
        </Box>

        {isLogged && userWallet && !did && (
          <>
            <Divider sx={{ my: 2 }} />
            <ClaimDID />
          </>
        )}

        {isLogged && userWallet && !!did && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography
              sx={{ mb: 1, fontSize: '0.875rem', wordBreak: 'break-all' }}
            >
              {did}
            </Typography>
          </>
        )}
      </Paper>
    </Container>
  );
}
