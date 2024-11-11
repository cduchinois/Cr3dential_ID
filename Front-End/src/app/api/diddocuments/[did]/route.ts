import { NextRequest, NextResponse } from "next/server";
import { Client } from "xrpl";

import {
  DEFAULT_NETWORK,
  getNetworkUrl,
  NetworkType,
} from "@/lib/networkConfig";

/**
 * GET endpoint to fetch a DID document for a given DID
 * @param request - The incoming request object
 * @param params - Object containing the DID parameter
 * @returns NextResponse with the DID document or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { did: string } }
) {
  let client: Client | null = null;

  // Get network from search params, fallback to DEFAULT_NETWORK
  const { searchParams } = new URL(request.url);
  const network = (searchParams.get("network") ||
    DEFAULT_NETWORK) as NetworkType;

  try {
    console.log("Fetching DID document for:", params.did);

    const did = params.did;
    if (!did) {
      console.warn("Missing DID parameter in request");
      return NextResponse.json(
        { error: "Missing required parameter: did" },
        { status: 400 }
      );
    }

    // Extract account from DID (format: did:xrpl:1:account)
    const account = did.split(":").pop();
    if (!account) {
      console.warn("Invalid DID format:", did);
      return NextResponse.json(
        { error: "Invalid DID format" },
        { status: 400 }
      );
    }

    // Connect to XRPL
    console.log("Connecting to XRPL network:", network);
    client = new Client(getNetworkUrl(network));
    await client.connect();

    // Fetch account objects to find DID object
    console.log("Fetching account objects for:", account);
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
      console.log("No DID document found, returning default structure");
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
      console.log("Converting hex URI to string");
      didUri = Buffer.from(didUri.replace("0x", ""), "hex").toString("utf8");
    }

    // Fetch DID Document from IPFS
    console.log("Fetching DID Document from URI:", didUri);
    const response2 = await fetch(didUri);
    if (!response2.ok) {
      throw new Error("Failed to fetch DID Document from IPFS");
    }

    const documentText = await response2.text();
    console.log("DID Document:", documentText);

    let document: any | null = null;

    try {
      document = JSON.parse(documentText);
    } catch (error) {
      // Try decoding as base58 if JSON parsing fails
      try {
        const decodedText = Buffer.from(
          JSON.parse(`[${documentText}]`)
        ).toString("utf8");
        document = JSON.parse(decodedText);
      } catch (decodeError) {
        console.error(
          "Failed to parse document as JSON or decode base58:",
          decodeError
        );
        throw new Error("Invalid DID Document format");
      }
    }

    console.log("Successfully retrieved DID document");

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
      console.log("Disconnecting from XRPL");
      await client.disconnect();
    }
  }
}
