export type NetworkType = "mainnet" | "testnet" | "devnet";

export const NETWORK_URLS = {
  mainnet: "wss://s1.ripple.com/",
  testnet: "wss://s.altnet.rippletest.net:51233",
  devnet: "wss://s.devnet.rippletest.net:51233",
};

export const DEFAULT_NETWORK: NetworkType =
  (process.env.XRPL_NETWORK as NetworkType) || "testnet";

// Store current network in memory
let currentNetwork: NetworkType = DEFAULT_NETWORK;

export const getCurrentNetwork = (): NetworkType => currentNetwork;
export const setCurrentNetwork = (network: NetworkType) => {
  currentNetwork = network;
};

export const getNetworkUrl = (
  network: NetworkType = currentNetwork
): string => {
  return NETWORK_URLS[network];
};
