import { NextRequest, NextResponse } from "next/server";

import { credentialOfferData, credentialOfferTypes } from "../credentials";

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
    const { id, did, challenge, signature } = body;

    // Validate required fields
    if (!id || !did || !challenge || !signature) {
      return NextResponse.json(
        {
          error: "Missing required fields: did, type, challenge, and signature",
        },
        { status: 400 }
      );
    }

    // TODO: Verify signature
    // TODO: Process credential offer acceptance

    return NextResponse.json(
      {
        success: true,
        message: "Credential offer accepted successfully",
      },
      { status: 202 } // Changed to 202 Accepted
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to process credential offer: ${error}` },
      { status: 500 }
    );
  }
}
