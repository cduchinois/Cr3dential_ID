import { NextRequest, NextResponse } from "next/server";
import { Client, Wallet } from "xrpl";

import { getNetworkUrl } from "@/lib/networkConfig";

import { credentialOfferData, credentialOfferTypes } from "../credentials";
import { GET as getIssuerMetadata } from "../../issuers/route";

import { W3CCredential } from "@/types/credential";

// Add Issuer configuration
const ISSUER_SEED = process.env.ISSUER_SEED;

// Add Pinata configuration
const PINATA_JWT = process.env.PINATA_JWT;

if (!PINATA_JWT) {
  console.warn("Missing PINATA_JWT environment variable");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { error: "Missing required parameter: type" },
        { status: 400 }
      );
    }

    if (!credentialOfferTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid credential type" },
        { status: 400 }
      );
    }

    // Fetch issuer metadata
    const issuerResponse = await getIssuerMetadata(request);
    const issuerData = await issuerResponse.json();

    const credentialOffer = {
      type: type,
      issuer: issuerData.issuer.did,
      fields: credentialOfferData[type],
    };

    return NextResponse.json({
      success: true,
      credentialOffer,
      issuer: issuerData.issuer,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch credential offer: ${error}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let client: Client | null = null;

  try {
    const body = await request.json();
    const { credentialOffer, challenge, signature } = body;

    // Validate required fields
    if (!credentialOffer || !challenge || !signature) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: credentialOffer, challenge, and signature",
        },
        { status: 400 }
      );
    }

    // Validate issuer private key
    if (!ISSUER_SEED) {
      throw new Error("Missing ISSUER_SEED environment variable");
    }

    // Create XRPL client and connect
    client = new Client(getNetworkUrl());
    await client.connect();

    // Create issuer wallet from private key
    const issuerWallet = Wallet.fromSeed(ISSUER_SEED);
    console.log("Issuer wallet created:", issuerWallet.classicAddress);

    // Get credential data and create W3C credential as before
    const credentialData =
      credentialOfferData[credentialOffer.credentialSchema[0].id];
    if (!credentialData) {
      throw new Error("Invalid credential type");
    }

    // Create W3C Credential (existing code...)
    const w3cCredential: W3CCredential = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v1",
      ],
      id: credentialOffer.id,
      type: [
        "VerifiableCredential",
        `${
          credentialOffer.type.charAt(0).toUpperCase() +
          credentialOffer.type.toLowerCase().slice(1)
        }Credential`,
      ],
      issuer: (await (await getIssuerMetadata(request)).json()).issuers[0].did,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: credentialOffer.subject,
        ...credentialData.fields,
      },
      image: credentialOffer.image || getCredentialImage(credentialOffer.type),
      proof: {
        type: "XrplSecp256k1Signature2019",
        created: new Date().toISOString(),
        verificationMethod: `${credentialOffer.subject}#keys-1`,
        proofPurpose: "assertionMethod",
        proofValue: signature,
      },
    };

    // Upload to Pinata (existing code...)
    const pinataResponse = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataContent: w3cCredential,
          pinataMetadata: {
            name: `${w3cCredential.id}`,
          },
        }),
      }
    );

    if (!pinataResponse.ok) {
      throw new Error("Failed to upload credential to IPFS");
    }

    const pinataData = await pinataResponse.json();
    const ipfsHash = pinataData.IpfsHash;
    const didDocumentUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    // Create DIDSet transaction
    const didSetTx = {
      TransactionType: "DIDSet",
      Account: issuerWallet.classicAddress,
      URI: Buffer.from(didDocumentUrl).toString("hex").toUpperCase(),
      Flags: 0,
    };

    // Submit DIDSet transaction
    const didSetResult = await client.submitAndWait(didSetTx, {
      wallet: issuerWallet,
    });

    if (didSetResult.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error(
        `DIDSet failed: ${didSetResult.result.meta.TransactionResult}`
      );
    }

    console.log("DIDSet transaction successful:", didSetResult);

    // Store credential with IPFS reference and transaction details
    const storedCredential = {
      ...w3cCredential,
      status: "active",
      ipfsHash,
      didDocumentUrl,
      didSetTxHash: didSetResult.result.hash,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Credential created and DID set successfully",
        credential: storedCredential,
        didDocumentUrl,
        txHash: didSetResult.result.hash,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Error processing credential offer:", error);
    return NextResponse.json(
      { error: `Failed to process credential offer: ${error}` },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.disconnect();
    }
  }
}

// Helper function to get credential image based on type
function getCredentialImage(type: string): string {
  const imageMap: Record<string, string> = {
    "42-software-engineering": "/images/42-logo.png",
    "easya-training": "/images/easya-logo.png",
    "futureverse-training-dev": "/images/futureverse-logo.png",
    "identity-m": "/images/identity-logo.png",
    "identity-f": "/images/identity-logo.png",
    "xrpl-training": "/images/xrpl-logo.png",
    "xrpl-commons-education-week": "/images/xrpl-logo.png",
  };

  return imageMap[type] || "/images/default-credential.png";
}
