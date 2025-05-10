export interface W3CCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: {
    did: string;
    [key: string]: any;
  };
  image?: string;
  proof?: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
  };
}

export interface StoredCredential extends W3CCredential {
  status: 'active' | 'revoked' | 'expired';
}