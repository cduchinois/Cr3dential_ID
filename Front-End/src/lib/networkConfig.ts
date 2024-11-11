export type NetworkType = "mainnet" | "testnet" | "devnet";

export const NETWORK_URLS = {
  mainnet: "wss://s1.ripple.com/",
  testnet: "wss://s.altnet.rippletest.net:51233",
  devnet: "wss://s.devnet.rippletest.net:51233",
};

export const DEFAULT_NETWORK: NetworkType =
  (process.env.XRPL_DEFAULT_NETWORK as NetworkType) || "testnet";

// Get current network from localStorage or use default
let currentNetwork: NetworkType =
  (typeof window !== "undefined" &&
    (localStorage.getItem("network") as NetworkType)) ||
  DEFAULT_NETWORK;

export const getCurrentNetwork = (): NetworkType => currentNetwork;
export const setCurrentNetwork = (network: NetworkType) => {
  currentNetwork = network;
};

export const getNetworkUrl = (
  network: NetworkType = currentNetwork || DEFAULT_NETWORK
): string => {
  return NETWORK_URLS[network];
};
