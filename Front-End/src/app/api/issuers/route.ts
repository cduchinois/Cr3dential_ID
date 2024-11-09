import { StaticImageData } from "next/image";
import { NextRequest, NextResponse } from "next/server";

import logo42 from "@/assets/423918.logowik.com.webp";
import futureverseLogo from "@/assets/futureverse.png";
import easyALogo from "@/assets/uBaka3Xr_400x400.jpg";
import xrpLogo from "@/assets/xrp-xrp-logo-CBBF77A5CF-seeklogo.com.webp";

interface IssuerMetadata {
  did?: string;
  name: string;
  description: string;
  image: string | StaticImageData;
  url: string;
}

const issuersMetadata: IssuerMetadata[] = [
  {
    // did: "did:xrp:1:rEn1LyQuaMaqbz8kBkamQeXjHqX1t7kVNe",
    name: "42",
    description:
      "42 is a future-proof computer science training to educate the next generation of software engineers.",
    image: logo42,
    url: "https://42.fr/",
  },
  {
    // did: "did:xrp:1:rEABey99Sy7nohSEp9hWxjHMjUDSsBxeXi",
    name: "EasyA",
    description:
      'EasyA teaches you how to build with top blockchains and deploy dApps faster than you can say "WAGMI"!',
    image: easyALogo,
    url: "https://www.easya.io",
  },
  {
    // did: "did:xrp:1:rUhRUukKmFk18Tuujc5hiT2iQ6NdBBjo7x",
    name: "Futureverse",
    description: "Building the future of digital experiences",
    image: futureverseLogo,
    url: "https://www.futureverse.com",
  },
  {
    // did: "did:xrp:1:r4JWSRAf1wSojHg7JEf6H9JT4eJ6tajHui",
    name: "XRPL Commons",
    description: "Building the commons with the XRPL Community",
    image: xrpLogo,
    url: "https://www.xrpl-commons.org/",
  },
  {
    // did: "did:xrp:1:rHUy4Vuc4J1sgkijpFt8QvWH9kjhksVP7y",
    name: "Cr3dential",
    description:
      "A universal wallet for managing digital credentials and verifiable claims",
    image: xrpLogo, // TODO change
    url: "https://www.xrpl-commons.org/",
  },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      issuers: issuersMetadata,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch issuer metadata: ${error}` },
      { status: 500 }
    );
  }
}
