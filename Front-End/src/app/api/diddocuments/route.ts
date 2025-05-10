import { NextRequest, NextResponse } from "next/server";

const PINATA_JWT = process.env.PINATA_JWT;

if (!PINATA_JWT) {
  console.warn("Missing PINATA_JWT environment variable");
}

export async function POST(request: NextRequest) {
  try {
    const { didDocument, credentialHash } = await request.json();

    if (!didDocument || !credentialHash) {
      return NextResponse.json(
        { error: "Missing required fields: didDocument and credentialHash" },
        { status: 400 }
      );
    }

    // Add the new credential hash to the document
    const updatedDocument = {
      ...didDocument,
      credentialSubject: {
        ...didDocument.credentialSubject,
        credentials: [
          credentialHash,
          ...(didDocument.credentialSubject?.credentials || []),
        ],
      },
    };

    // Upload updated DID document to IPFS via Pinata
    const pinataResponse = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataContent: updatedDocument,
          pinataMetadata: {
            name: `did-document-${didDocument.id}-${Date.now()}`,
          },
        }),
      }
    );

    if (!pinataResponse.ok) {
      throw new Error("Failed to upload updated DID document to IPFS");
    }

    const pinataData = await pinataResponse.json();
    const didDocumentUrl = `https://gateway.pinata.cloud/ipfs/${pinataData.IpfsHash}`;

    return NextResponse.json({
      success: true,
      didDocumentUrl,
      document: updatedDocument,
    });
  } catch (error) {
    console.error("Error updating DID document:", error);
    return NextResponse.json(
      { error: `Failed to update DID document: ${error}` },
      { status: 500 }
    );
  }
}
