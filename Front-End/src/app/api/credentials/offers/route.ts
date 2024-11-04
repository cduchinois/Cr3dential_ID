import { NextRequest, NextResponse } from "next/server";

import { credentialOfferData, credentialOfferTypes } from "../credentials";

import { W3CCredential } from "@/types/credential";

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

    const credentialOffer = {
      type: type,
      issuer: "did:xrp:1:1234567890", // TODO: Import from config
      fields: credentialOfferData[type],
    };

    return NextResponse.json({
      success: true,
      credentialOffer,
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
    const body = await request.json();
    const { credentialOffer, challenge, signature } = body;

    // Validate required fields
    if (!credentialOffer || !challenge || !signature) {
      return NextResponse.json(
        {
          error: "Missing required fields: did, type, challenge, and signature",
        },
        { status: 400 }
      );
    }

    // Get the credential data based on type
    const credentialData = credentialOfferData[credentialOffer.type];
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
      type: ["VerifiableCredential", credentialOffer.type], // Add the specific credential type
      typeLabel: credentialOffer.typeLabel,
      issuer: "did:xrp:1:1234567890",
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: credentialOffer.holder,
        ...credentialData, // Add all fields from the credential data
      },
      image: credentialOffer.image || getCredentialImage(credentialOffer.type), // Add appropriate image based on credential type
      proof: {
        type: "XrplSecp256k1Signature2019",
        created: new Date().toISOString(),
        verificationMethod: `${credentialOffer.holder}#keys-1`,
        proofPurpose: "assertionMethod",
        proofValue: signature,
      },
    };

    // Create DID Document URL (simulated)
    const didDocumentUrl = `https://did.example.com/credential/${credentialOffer.id}`;

    // Store credential in localStorage (client-side storage will be handled in the frontend)
    const storedCredential = {
      id: crypto.randomUUID(),
      ...w3cCredential,
      status: "active",
    };

    return NextResponse.json(
      {
        success: true,
        message: "Credential created successfully",
        credential: storedCredential,
        didDocumentUrl,
      },
      { status: 202 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to process credential offer: ${error}` },
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
  };

  return imageMap[type] || "/images/default-credential.png";
}
