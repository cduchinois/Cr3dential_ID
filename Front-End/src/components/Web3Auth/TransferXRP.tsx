'use client';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useState } from 'react';

import { useWeb3Auth } from '@/hooks/useWeb3Auth';

export default function TransferXRP() {
  const { transferXRP } = useWeb3Auth();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSuccess(false);
    setAmount('');
    setAddress('');
  };

  const handleTransfer = async () => {
    try {
      setError(null);
      setSuccess(false);

      if (!amount || !address) {
        setError('Please fill in all fields');
        return;
      }

      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      await transferXRP(address, amountNumber);
      setSuccess(true);

      // Trigger a balance refresh
      const balanceEvent = new CustomEvent('balanceUpdated');
      window.dispatchEvent(balanceEvent);

      setTimeout(handleClose, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    }
  };

  return (
    <>
      <Button
        variant='outlined'
        onClick={handleOpen}
        size='small'
        sx={{
          color: '#00c1d2',
          borderColor: '#00c1d2',
          '&:hover': {
            borderColor: '#00919e',
            color: '#00919e',
          },
        }}
      >
        Transfer XRP
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: '#212f4e',
          },
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>Transfer XRP</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity='success' sx={{ mb: 2 }}>
              Transfer successful!
            </Alert>
          )}

          <TextField
            autoFocus
            margin='dense'
            label='Recipient Address'
            fullWidth
            variant='outlined'
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#00c1d2',
                },
                '&:hover fieldset': {
                  borderColor: '#00919e',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#00c1d2',
              },
              '& .MuiOutlinedInput-input': {
                backgroundColor: '#ffffff00',
                color: '#fff',
              },
            }}
          />
          <TextField
            margin='dense'
            label='Amount (XRP)'
            fullWidth
            variant='outlined'
            type='number'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#00c1d2',
                },
                '&:hover fieldset': {
                  borderColor: '#00919e',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#00c1d2',
              },
              '& .MuiOutlinedInput-input': {
                backgroundColor: '#ffffff00',
                color: '#fff',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            sx={{
              color: '#00c1d2',
              '&:hover': {
                color: '#00919e',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            variant='contained'
            sx={{
              backgroundColor: '#00c1d2',
              '&:hover': {
                backgroundColor: '#00919e',
              },
            }}
          >
            Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
