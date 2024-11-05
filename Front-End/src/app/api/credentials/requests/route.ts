import { NextRequest, NextResponse } from "next/server";

import {
  credentialOfferData,
  credentialOfferTypes,
} from "@/app/api/credentials/credentials";
import { CredentialOffer } from "@/app/credential-app/credential-offer/page";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { did, email, type } = body;

    // Validate required fields
    const missingFields = [];
    if (!did) missingFields.push("did");
    if (!email) missingFields.push("email");
    if (!type) missingFields.push("type");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!credentialOfferTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid credential type" },
        { status: 400 }
      );
    }

    // Create credential offer object
    const credentialOffer: CredentialOffer = {
      id: crypto.randomUUID(),
      type: credentialOfferData[type].type,
      issuer: credentialOfferData[type].issuer,
      credentialSubject: {
        did,
        ...credentialOfferData[type].fields,
      },
      credentialSchema: [
        {
          id: type,
          type: "JsonSchema",
        },
      ],
      validFrom: new Date().toISOString(),
      validUntil: credentialOfferData[type].expiresInDays
        ? new Date(
            Date.now() +
              credentialOfferData[type].expiresInDays * 24 * 60 * 60 * 1000
          ).toISOString()
        : undefined,
      image: credentialOfferData[type].image,
      status: "pending-approval",
    };

    return NextResponse.json({
      success: true,
      credentialOffer,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create credential offer: ${error}` },
      { status: 500 }
    );
  }
}
