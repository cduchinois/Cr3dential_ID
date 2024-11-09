import { NextRequest, NextResponse } from "next/server";
import { Client } from "xrpl";

import { getNetworkUrl } from "@/lib/networkConfig";

export async function GET(
  request: NextRequest,
  { params }: { params: { did: string } }
) {
  let client: Client | null = null;

  try {
    const did = params.did;
    if (!did) {
      return NextResponse.json(
        { error: "Missing required parameter: did" },
        { status: 400 }
      );
    }

    // Extract account from DID (format: did:xrpl:1:account)
    const account = did.split(":").pop();
    if (!account) {
      return NextResponse.json(
        { error: "Invalid DID format" },
        { status: 400 }
      );
    }

    // Connect to XRPL
    client = new Client(getNetworkUrl());
    await client.connect();

    // Fetch account objects to find DID object
    const response = await client.request({
      command: "account_objects",
      account: account,
      type: "did",
    });

    // Find the DID object
    const didObject = response.result.account_objects?.find(
      (obj: any) => obj.LedgerEntryType === "DID"
    );

    if (!didObject?.URI) {
      // If no DID document found, return a default structure
      return NextResponse.json({
        success: true,
        document: {
          "@context": ["https://www.w3.org/ns/did/v1"],
          id: did,
          controller: did,
          credentialSubject: {
            did,
            credentials: [],
          },
          verificationMethod: [
            {
              id: `${did}#keys-1`,
              type: "EcdsaSecp256k1VerificationKey2019",
              controller: did,
              publicKeyMultibase: "default", // This would be replaced with actual key
            },
          ],
          authentication: [`${did}#keys-1`],
          assertionMethod: [`${did}#keys-1`],
          service: [],
        },
      });
    }

    // Convert hex URI to string if needed
    let didUri = didObject.URI;
    if (didUri.startsWith("0x") || /^[0-9A-F]+$/i.test(didUri)) {
      didUri = Buffer.from(didUri.replace("0x", ""), "hex").toString("utf8");
    }

    // Fetch DID Document from IPFS
    const response2 = await fetch(didUri);
    if (!response2.ok) {
      throw new Error("Failed to fetch DID Document from IPFS");
    }

    const document = await response2.json();

    return NextResponse.json({
      success: true,
      document,
      uri: didUri,
    });
  } catch (error) {
    console.error("Error fetching DID document:", error);
    return NextResponse.json(
      { error: `Failed to fetch DID document: ${error}` },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.disconnect();
    }
  }
}
