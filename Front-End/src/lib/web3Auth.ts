import { CHAIN_NAMESPACES, UX_MODE, WEB3AUTH_NETWORK } from '@web3auth/base';
import { Web3Auth } from '@web3auth/modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { XrplPrivateKeyProvider } from '@web3auth/xrpl-provider';

const clientId = process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID;
console.log('Environment variables:', {
  clientId,
  allEnv: process.env
});

export const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.XRPL,
  chainId: '0x2',
  // Avoid using public rpcTarget & wsTarget in production.
  // Use services like Infura, Quicknode etc
  rpcTarget: 'https://ripple-node.tor.us',
  wsTarget: 'wss://s.devnet.rippletest.net:51233/',
  ticker: 'XRP',
  tickerName: 'XRPL',
  displayName: 'xrpl devnet',
  blockExplorer: 'https://devnet.xrpl.org',
};

export const openloginAdapter = new OpenloginAdapter({
  loginSettings: {
    mfaLevel: 'none',
  },
  adapterSettings: {
    uxMode: 'redirect', // "redirect" | "popup"
    whiteLabel: {
      logoLight: 'https://web3auth.io/images/web3authlog.png',
      logoDark: 'https://web3auth.io/images/web3authlogodark.png',
      defaultLanguage: 'en', // en, de, ja, ko, zh, es, fr, pt, nl
      // dark: false, // whether to enable dark mode. defaultValue: false
    },
    mfaSettings: {
      deviceShareFactor: {
        enable: true,
        priority: 1,
        mandatory: true,
      },
      backUpShareFactor: {
        enable: true,
        priority: 2,
        mandatory: false,
      },
      socialBackupFactor: {
        enable: true,
        priority: 3,
        mandatory: false,
      },
      passwordFactor: {
        enable: true,
        priority: 4,
        mandatory: false,
      },
    },
  },
});

export const xrplProvider = new XrplPrivateKeyProvider({
  config: {
    chainConfig: chainConfig,
  },
});

export const instantiateWeb3Auth = () => {
  if (!process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID) {
    console.error('Environment check failed:', {
      clientId: process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID,
      env: process.env
    });
    throw new Error('NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID is not defined in environment variables');
  }
  
  return new Web3Auth({
    clientId: process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    privateKeyProvider: xrplProvider,
    chainConfig: chainConfig
  });
};
