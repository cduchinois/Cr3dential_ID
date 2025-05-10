export interface DIDDocument {
  '@context': string[];
  id: string;
  controller: string;
  verificationMethod: {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase?: string;
  }[];
  authentication: string[];
  assertionMethod: string[];
  service?: {
    id: string;
    type: string;
    serviceEndpoint: string;
  }[];
}

export interface StoredDIDDocument extends DIDDocument {
  linkedCredentials: string[]; // Array of credential IDs
}