'use server';

import bs58 from 'bs58';

export const uploadToIPFS = async (dataJson: string): Promise<string> => {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const headers = {
    authorization: `Bearer ${process.env.PINATA_JWT}`,
  };

  const blob = new Blob([dataJson], { type: 'text/plain' });
  const data = new FormData();
  data.append('file', blob);

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: data,
  });

  const json = await response.json();

  return json.IpfsHash;
};

const prefixPinata = 'https://gateway.pinata.cloud/ipfs/';

export async function createStudentDID(
  issuerWalletAdress: string,
  base58String: string
) {
  try {
    // Decode the base58 string back to the DID document
    const decodedBytes = bs58.decode(base58String);
    const didDocument = decodedBytes.toString('utf8');
    console.log('Decoded DID document:', didDocument);

    // Upload the DID document to IPFS
    const didIPFSLink = await uploadToIPFS(didDocument);
    console.log('DID document uploaded to IPFS:', didIPFSLink);

    return prefixPinata + didIPFSLink;
  } catch (error) {
    console.error('Error in createStudentDID:', error);
    throw error;
  }
}

export async function createIssuerDID(
  issuerWalletAdress: string,
  publicKeyForAssertion: string
) {
  const did = `did:xrpl:1:${issuerWalletAdress}`;

  const profile = {
    type: 'University',
    name: 'EasyA',
    sector: 'Education',
    website: 'https://easya.com/',
  };

  const profileIPFSLink = await uploadToIPFS(JSON.stringify(profile));

  const didDocument = {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: did,
    controller: did,
    verificationMethod: [
      {
        id: `${did}#keys-1`,
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: did,
        publicKeyHex: publicKeyForAssertion,
      },
    ],
    service: [
      {
        id: `${did}#profile`,
        type: 'Public Profile',
        serviceEndpoint: prefixPinata + profileIPFSLink,
      },
    ],
  };

  const didIPFSLink = await uploadToIPFS(JSON.stringify(didDocument));
  return prefixPinata + didIPFSLink;
}
