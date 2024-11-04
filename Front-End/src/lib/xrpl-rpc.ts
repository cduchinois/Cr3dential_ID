import { IProvider } from "@web3auth/base";
import { convertStringToHex, DIDSet, Payment, xrpToDrops } from "xrpl";
import * as xrpl from "xrpl";
import { getCurrentNetwork, getNetworkUrl } from "./networkConfig";

interface SignedTransaction {
  tx_blob: string;
  hash: string;
}

interface AccountInfo {
  result: {
    account_data: {
      Sequence: number;
    };
  };
}

export default class XrplRPC {
  private provider: IProvider;

  constructor(provider: IProvider) {
    this.provider = provider;
  }

  getAccounts = async (): Promise<any> => {
    try {
      const provider = this.provider;
      const accounts = await provider.request<string[]>({
        method: "xrpl_getAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const client = new xrpl.Client(getNetworkUrl());
      await client.connect();

      try {
        const accountInfo = await client.request({
          command: "account_info",
          account: accounts[0] as string,
          ledger_index: "validated",
        });

        await client.disconnect();
        return {
          account: accounts[0],
          ...accountInfo.result,
        };
      } catch (error) {
        await client.disconnect();
        if (error.data?.error === "actNotFound") {
          return {
            account: accounts[0],
            needsFunding: true,
            error: "actNotFound",
            error_message: "Account not found",
          };
        }
        throw error;
      }
    } catch (error) {
      console.error("Error in getAccounts:", error);
      throw error;
    }
  };

  getBalance = async (): Promise<any> => {
    try {
      const accounts = await this.provider.request<string[], never>({
        method: "xrpl_getAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const client = new xrpl.Client(getNetworkUrl());
      await client.connect();

      try {
        const balances = await client.getBalances(accounts[0]);
        await client.disconnect();

        // Find XRP balance from the balances array
        const xrpBalance = balances.find((b) => b.currency === "XRP");

        console.log("Account balances:", {
          address: accounts[0],
          balances: balances,
          rawXRPBalance: xrpBalance?.value,
        });

        // Return the raw balance without any conversion
        return xrpBalance ? xrpBalance.value : "0";
      } catch (error) {
        await client.disconnect();

        if (error.data?.error === "actNotFound") {
          return "0";
        }
        throw error;
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw error;
    }
  };

  signMessage = async (): Promise<any> => {
    try {
      const msg = "Hello world";
      const hexMsg = convertStringToHex(msg);
      const txSign = await this.provider.request<{ signature: string }, never>({
        method: "xrpl_signMessage",
        params: {
          signature: hexMsg,
        },
      });
      return txSign;
    } catch (error) {
      console.log("error", error);
      return error;
    }
  };

  signAndSetDid = async (didUriHex: string): Promise<any> => {
    console.log("Starting DID creation process...");
    try {
      const accounts = await this.provider.request<string[]>({
        method: "xrpl_getAccounts",
      });

      if (!accounts?.[0]) {
        throw new Error("No accounts found");
      }

      const client = new xrpl.Client(getNetworkUrl());
      await client.connect();

      try {
        // Check account info
        const accountInfo = await client.request<AccountInfo>({
          command: "account_info",
          account: accounts[0],
          ledger_index: "validated",
        });

        // Convert the DID URI to hex format
        const hexUri = Buffer.from(didUriHex).toString("hex").toUpperCase();
        console.log("DID URI in hex format:", hexUri);

        // Create transaction with hex URI
        const transaction = {
          TransactionType: "DIDSet",
          Account: accounts[0],
          URI: hexUri, // Using hex format
          Fee: "12",
          Sequence: accountInfo.result.account_data.Sequence,
          Flags: 0,
        };

        console.log("Prepared transaction:", transaction);

        // Sign transaction
        const signedTx = await this.provider.request<SignedTransaction, never>({
          method: "xrpl_signTransaction",
          params: {
            transaction,
          },
        });

        if (!signedTx?.tx_blob) {
          throw new Error("Failed to sign transaction");
        }

        // Submit transaction
        const submitResponse = await client.request({
          command: "submit",
          tx_blob: signedTx.tx_blob,
        });

        console.log("Submit response:", submitResponse);

        if (submitResponse.result.engine_result !== "tesSUCCESS") {
          throw new Error(
            `Transaction failed: ${submitResponse.result.engine_result_message}`
          );
        }

        // Wait for validation
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Verify the transaction
        try {
          const txHash = submitResponse.result.tx_json.hash;
          if (!txHash) {
            throw new Error("Transaction hash not found");
          }

          const tx = await client.request({
            command: "tx",
            transaction: txHash,
          });

          console.log("Transaction verified:", tx);

          const explorerUrl = getExplorerUrl(txHash);
          console.log("Explorer URL:", explorerUrl);

          await client.disconnect();
          return {
            success: true,
            did: didUriHex,
            transaction: submitResponse,
            explorerUrl: explorerUrl,
            txHash: txHash,
          };
        } catch (verifyError) {
          console.error("Error verifying transaction:", verifyError);
          throw verifyError;
        }
      } catch (error) {
        console.error("Error in DID creation:", error);
        await client.disconnect();
        throw error;
      }
    } catch (error) {
      console.error("Failed to set DID:", error);
      throw error;
    }
  };

  getDidFromAccount = async (address: string): Promise<string | null> => {
    try {
      console.log("Getting DID for address:", address);
      const client = new xrpl.Client(getNetworkUrl());
      await client.connect();

      try {
        const response = await client.request({
          command: "account_objects",
          account: address,
          type: "did",
        });

        console.log("Account objects response:", response);

        if (
          response.result.account_objects &&
          response.result.account_objects.length > 0
        ) {
          console.log("Found DID objects:", response.result.account_objects.length);

          // Find the DID object
          const didObject = response.result.account_objects.find(
            (obj: any) => obj.LedgerEntryType === "DID"
          );

          if (didObject && didObject.URI) {
            console.log("Found DID object:", didObject);

            // Convert hex URI to string if needed
            let didUri = didObject.URI;
            if (didUri.startsWith('0x') || /^[0-9A-F]+$/i.test(didUri)) {
              // Convert hex to string if it's in hex format
              didUri = Buffer.from(didUri.replace('0x', ''), 'hex').toString('utf8');
            }

            // Format the DID string
            const formattedDid = `did:xrpl:1:${address}`;
            console.log("Found DID:", formattedDid);
            return formattedDid;
          }
        }

        // If no DID is found, return a default format
        const defaultDid = `did:xrpl:1:${address}`;
        console.log("No DID found, using default format:", defaultDid);
        return defaultDid;

      } catch (error) {
        console.error("Error fetching DID:", error);
        return null;
      } finally {
        await client.disconnect();
      }
    } catch (error) {
      console.error("Failed to get DID:", error);
      return null;
    }
  };

  signAndSendTransaction = async (): Promise<any> => {
    try {
      const accounts = await this.provider.request<never, string[]>({
        method: "xrpl_getAccounts",
      });

      if (accounts && accounts.length > 0) {
        const tx: Payment = {
          TransactionType: "Payment",
          Account: accounts[0] as string,
          Amount: xrpToDrops(0.0001),
          Destination: "rM9uB4xzDadhBTNG17KHmn3DLdenZmJwTy",
        };
        const txSign = await this.provider.request({
          method: "xrpl_submitTransaction",
          params: {
            transaction: tx,
          },
        });
        return txSign;
      } else {
        return "failed to fetch accounts";
      }
    } catch (error) {
      console.log("error", error);
      return error;
    }
  };

  async fundAccount(destinationAddress: string): Promise<any> {
    try {
      console.log("Starting funding process for address:", destinationAddress);
      const client = new xrpl.Client(getNetworkUrl());

      console.log("Connecting to XRPL testnet...");
      await client.connect();
      console.log("Connected to XRPL testnet");

      try {
        // First get a funded wallet from the testnet faucet
        console.log("Requesting faucet wallet...");
        const {
          wallet: faucetWallet,
          balance: faucetBalance,
        } = await client.fundWallet();

        console.log("Faucet wallet created:", {
          address: faucetWallet.classicAddress,
          balance: faucetBalance,
        });

        // Create the payment transaction with exactly 20 XRP
        const tx: xrpl.Payment = {
          TransactionType: "Payment",
          Account: faucetWallet.classicAddress,
          Destination: destinationAddress,
          Amount: "20000000", // 20 XRP = 20,000,000 drops
        };

        console.log("Submitting payment transaction:", {
          ...tx,
          AmountInXRP: 20, // Log the actual XRP amount
        });

        // Using submitAndWait to ensure transaction is processed
        const result = await client.submitAndWait(tx, {
          autofill: true,
          wallet: faucetWallet,
        });

        console.log("Payment transaction result:", result);

        // Wait a bit for the ledger to update
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get the new balance after transaction
        const newBalance = await client.getBalances(destinationAddress);

        console.log("New wallet balance:", {
          address: destinationAddress,
          balance: newBalance[0]?.value,
          rawBalance: newBalance,
        });

        await client.disconnect();
        return {
          success: true,
          balance: newBalance[0]?.value || "0",
          txResult: result,
        };
      } catch (error) {
        console.error("Error in funding process:", error);
        await client.disconnect();
        throw error;
      }
    } catch (error) {
      console.error("Failed to fund account:", error);
      throw error;
    }
  }
}

// Add this helper function
const getExplorerUrl = (hash: string): string => {
  const network = getCurrentNetwork();
  switch (network) {
    case "mainnet":
      return `https://livenet.xrpl.org/transactions/${hash}`;
    case "testnet":
      return `https://testnet.xrpl.org/transactions/${hash}`;
    case "devnet":
      return `https://devnet.xrpl.org/transactions/${hash}`;
    default:
      return `https://testnet.xrpl.org/transactions/${hash}`;
  }
};
