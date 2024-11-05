import { NextRequest, NextResponse } from "next/server";

import { credentialOfferData, credentialOfferTypes } from "../credentials";

import { W3CCredential } from "@/types/credential";
import { GET as getIssuerMetadata } from "../../issuers/route";

// Add Pinata configuration
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

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
  try {
    const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
    
    if (!pinataJWT) {
      console.error('Missing Pinata JWT');
      return NextResponse.json(
        { error: 'Pinata JWT not configured' },
        { status: 500 }
      );
    }

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

    // Get the credential data based on type
    const credentialData =
      credentialOfferData[credentialOffer.credentialSchema[0].id];
    if (!credentialData) {
      return NextResponse.json(
        { error: "Invalid credential type" },
        { status: 400 }
      );
    }

    // Create W3C Verifiable Credential
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

    // Upload credential to Pinata with better error handling
    try {
      const pinataResponse = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${pinataJWT}`,
          },
          body: JSON.stringify({
            pinataContent: w3cCredential,
            pinataMetadata: {
              name: `${w3cCredential.type[1]}-${Date.now()}`,
            },
          }),
        }
      );

      if (!pinataResponse.ok) {
        const errorData = await pinataResponse.text();
        console.error('Pinata Error:', {
          status: pinataResponse.status,
          statusText: pinataResponse.statusText,
          error: errorData
        });
        throw new Error(`Pinata Error: ${pinataResponse.status} - ${errorData}`);
      }

      const pinataData = await pinataResponse.json();
      const ipfsHash = pinataData.IpfsHash;

      // Create DID Document URL using IPFS hash
      const didDocumentUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      // Store credential with IPFS reference
      const storedCredential = {
        ...w3cCredential,
        status: "active",
        ipfsHash,
        didDocumentUrl,
      };

      return NextResponse.json(
        {
          success: true,
          message: "Credential created and uploaded successfully",
          credential: storedCredential,
          didDocumentUrl,
        },
        { status: 202 }
      );
    } catch (pinataError: unknown) {
      console.error('Pinata Upload Error:', pinataError);
      const errorMessage = pinataError instanceof Error 
        ? pinataError.message 
        : 'Unknown Pinata error';
      return NextResponse.json(
        { error: `Failed to upload to IPFS: ${errorMessage}` },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error("Error processing credential offer:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to process credential offer: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Helper function to get credential image based on type
function getCredentialImage(type: string): string {
  const imageMap: Record<string, string> = {
    "42-software-engineering": "/images/42-logo.png",
    "easya-training": "/images/easya-logo.png",
    "identity-m": "/images/identity-logo.png",
    "identity-f": "/images/identity-logo.png",
    "xrpl-training": "/images/xrpl-logo.png",
    "futureverse-training-dev": "/images/futureverse-logo.png",
  };

  return imageMap[type] || "/images/default-credential.png";
}
