export interface W3CCredential {
  '@context': string[];
  type: string[];
  typeLabel?: string;
  issuer: string;
  issuanceDate: string;
  credentialSubject: {
    id: string;
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
  id: string;
  status: 'active' | 'revoked' | 'expired';
}