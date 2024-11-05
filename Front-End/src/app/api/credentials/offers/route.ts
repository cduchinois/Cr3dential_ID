import { NextRequest, NextResponse } from "next/server";

import { credentialOfferData, credentialOfferTypes } from "../credentials";

import { W3CCredential } from "@/types/credential";
import { GET as getIssuerMetadata } from "../../issuers/route";

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
      type: ["VerifiableCredential", `${credentialOffer.type}Credential`],
      typeLabel: credentialData.type,
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

    // Create DID Document URL (simulated)
    const didDocumentUrl = `https://did.example.com/credential/${credentialOffer.id}`; // TODO Set to the app origin

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
    "futureverse-training-dev": "/images/futureverse-logo.png",
  };

  return imageMap[type] || "/images/default-credential.png";
}
