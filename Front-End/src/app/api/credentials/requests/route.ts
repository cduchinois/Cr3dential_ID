import { StaticImageData } from "next/image";
import { NextRequest, NextResponse } from "next/server";

import {
  credentialOfferData,
  credentialOfferTypes,
} from "@/app/api/credentials/credentials";
import logo42 from "@/assets/423918.logowik.com.webp";
import easyALogo from "@/assets/uBaka3Xr_400x400.jpg";
import xrpLogo from "@/assets/xrp-xrp-logo-CBBF77A5CF-seeklogo.com.webp";
import futureverseLogo from "@/assets/futureverse.png";

export async function POST(request: NextRequest) {
  // Default images for different credential types
  const DEFAULT_IMAGES: Record<string, string | StaticImageData> = {
    "identity-m": `${request.nextUrl.origin}/images/identity-male.png`,
    "identity-f": `${request.nextUrl.origin}/images/identity-female.png`,
    "42-software-engineering": logo42,
    "easya-training": easyALogo,
    "xrpl-training": xrpLogo,
    "futureverse-training-dev": futureverseLogo,
    default: `${request.nextUrl.origin}/images/default-credential.png`,
  };

  try {
    // Parse request body
    const body = await request.json();
    const { did, email, type } = body;

    // Validate required fields
    if (!did || !email || !type) {
      return NextResponse.json(
        {
          error: "Missing required fields: did, email and type",
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
    const credentialOffer = {
      id: crypto.randomUUID(),
      type: type,
      typeLabel: credentialOfferData[type].type,
      image: DEFAULT_IMAGES[type] || DEFAULT_IMAGES.default,
      issuer: "did:xrp:1:1234567890", // TODO: Import from config
      holder: did,
      issuanceDate: new Date().toISOString(),
      expirationDate: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(), // 365 days from now
      status: "pending",
      fields: credentialOfferData[type].fields,
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
