/* eslint-disable @typescript-eslint/no-empty-function */
import { IProvider } from '@web3auth/base';
import { Web3Auth } from '@web3auth/modal';
import { createContext, useEffect, useState } from 'react';

import { instantiateWeb3Auth, openloginAdapter } from '@/lib/web3Auth';
import XrplRPC from '@/lib/xrpl-rpc';

import { createIssuerDID, createStudentDID } from '@/backend/DID-back';

export const AuthContext = createContext<AuthContextType>({
  web3Auth: null,
  setWeb3Auth: () => {},
  provider: null,
  setProvider: () => {},
  isInitialized: false,
  userWallet: null,
  isLogged: false,
  setIsLogged: () => {},
  loadingUserInfo: false,
  setLoadingUserInfo: () => {},
  needsFunding: false,
  login: () => {},
  createDid: () => {},
  createIssuerDid: () => {},
  getDid: () => {},
  transferXRP: () => {},
});

export const Web3AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userWallet, setUserWallet] = useState<Wallet | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [xrplRPC, setXrplRPC] = useState<XrplRPC | null>(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [needsFunding, setNeedsFunding] = useState(false);

  const onLogin = async () => {
    if (web3Auth) {
      try {
        const provider = await web3Auth.connect();
        setProvider(provider);
        setIsLogged(true);
      } catch (error) {
        console.error("Error during login:", error);
      }
    }
  };

  useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      const init = async () => {
        try {
          if (!web3Auth) {
            const newWeb3Auth = instantiateWeb3Auth();
            newWeb3Auth.configureAdapter(openloginAdapter);
            await newWeb3Auth.initModal();
            setWeb3Auth(newWeb3Auth);
            setIsInitialized(true);

            if (newWeb3Auth.connected) {
              setProvider(newWeb3Auth.provider);
              setIsLogged(true);
            }
          }
        } catch (error) {
          console.error("Failed to initialize Web3Auth:", error);
        }
      };
      init();
    }
  }, [isInitialized, web3Auth]);

  const fundWalletWithRPC = async (address: string, rpc: XrplRPC) => {
    try {
      setLoadingUserInfo(true);
      console.log('Starting wallet funding process for:', address);

      const fundingResult = await rpc.fundAccount(address);
      console.log('Funding completed:', fundingResult);

      if (fundingResult.success) {
        setNeedsFunding(false);

        // Wait a bit for the ledger to be updated
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Update the wallet with new balance info
        const accountInfo = await rpc.getAccounts();
        setUserWallet({
          address: accountInfo.account,
        });

        // Trigger a balance refresh in the UI
        const balanceEvent = new CustomEvent('balanceUpdated');
        window.dispatchEvent(balanceEvent);
      }
    } catch (error) {
      console.error('Failed to fund account:', error);
      setNeedsFunding(true);
    } finally {
      setLoadingUserInfo(false);
    }
  };

  useEffect(() => {
    if (isLogged && provider) {
      const initializeWallet = async () => {
        try {
          setLoadingUserInfo(true);
          const newXrplRPC = new XrplRPC(provider);
          setXrplRPC(newXrplRPC);

          console.log("Attempting to get accounts...");
          const accounts = await newXrplRPC.getAccounts();
          console.log('Account info:', accounts);

          setUserWallet({
            address: accounts.account,
          });

          if (accounts.needsFunding) {
            console.log('Account needs funding, initiating funding process...');
            setNeedsFunding(true);
            await fundWalletWithRPC(accounts.account, newXrplRPC);
          }
        } catch (error) {
          console.error("Failed to initialize wallet:", error);
        } finally {
          setLoadingUserInfo(false);
        }
      };

      initializeWallet();
    }
  }, [isLogged, provider]);

  const login = async () => {
    if (web3Auth) {
      const provider = await web3Auth.connect();
      setProvider(provider);
      setIsLogged(true);
    }
  };

  const createDid = async (issuerWallet: string, publicKeyHex: string) => {
    if (!provider || !xrplRPC) {
      console.error('Provider or xrplRPC not initialized');
      return;
    }

    const testIPFS = await createStudentDID(issuerWallet, publicKeyHex);
    const result = await xrplRPC.signAndSetDid(testIPFS);

    return result;
  };

  const createIssuerDid = async (
    issuerWallet: string,
    publicKeyHex: string
  ) => {
    if (!provider || !xrplRPC) {
      console.error('Provider or xrplRPC not initialized');
      return;
    }

    const testIPFS = await createIssuerDID(issuerWallet, publicKeyHex);
    const result = await xrplRPC.signAndSetDid(testIPFS);

    return result;
  };

  const getDid = async (address: string) => {
    if (!xrplRPC) {
      console.error('xrplRPC not initialized');
      return null;
    }
    return await xrplRPC.getDidFromAccount(address);
  };

  const transferXRP = async (destinationAddress: string, amount: number) => {
    if (!web3Auth || !provider) {
      throw new Error('Not connected to wallet');
    }

    try {
      const xrplClient = await getXrplClient();
      const wallet = await getWallet();

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const prepared = await xrplClient.autofill({
        TransactionType: 'Payment',
        Account: wallet.address,
        Amount: xrpl.xrpToDrops(amount.toString()),
        Destination: destinationAddress
      });

      const signed = wallet.sign(prepared);
      const result = await xrplClient.submitAndWait(signed.tx_blob);

      if (result.result.meta?.TransactionResult !== 'tesSUCCESS') {
        throw new Error('Transaction failed');
      }

      return result;
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        web3Auth,
        setWeb3Auth,
        provider,
        setProvider,
        isInitialized: isInitialized,
        userWallet,
        isLogged,
        setIsLogged,
        loadingUserInfo,
        setLoadingUserInfo,
        needsFunding,
        login,
        createDid,
        createIssuerDid,
        getDid,
        transferXRP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
