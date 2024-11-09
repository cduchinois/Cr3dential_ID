import { StaticImageData } from "next/image";

import { getUrl } from "@/lib/utils";

export const credentialOfferData: {
  [key: string]: {
    issuer: string;
    type: string;
    fields: { [key: string]: string | number };
    expiresInDays?: number;
    image?: string | StaticImageData;
  };
} = {
  "42-software-engineering": {
    issuer: "did:xrp:1:r42sgvxEQnKQsj8ZYhPYrur54EH1iwAivM",
    type: "training",
    fields: {
      name: "Software Engineering",
      provider: "42",
      location: "Paris, France",
    },
    image: getUrl("/images/logo-42.webp"),
  },
  "easya-training": {
    issuer: "did:xrp:1:rEABey99Sy7nohSEp9hWxjHMjUDSsBxeXi",
    type: "training",
    fields: {
      name: "Blockchain Basis",
      provider: "EasyA",
      location: "Paris, France",
    },
    image: getUrl("/images/logo-easya.jpg"),
  },
  "futureverse-training-dev": {
    issuer: "did:xrp:1:rUhRUukKmFk18Tuujc5hiT2iQ6NdBBjo7x",
    type: "training",
    fields: {
      name: "Developer Training",
      provider: "Futureverse",
      location: "Paris, France",
    },
    image: getUrl("/images/logo-futureverse.png"),
  },
  "identity-m": {
    issuer: "did:xrp:1:rHUy4Vuc4J1sgkijpFt8QvWH9kjhksVP7y",
    type: "identity",
    fields: {
      title: "Monsieur",
      firstName: "Jean-Pierre",
      lastName: "Dubois",
      dateOfBirth: "1988-09-23",
      country: "France",
      phoneNumber: "+33612345678",
      email: "jp.dubois@orange.fr",
      address: "15 Rue du Vieux Vignoble",
      city: "Bordeaux",
      state: "Nouvelle-Aquitaine",
      zipCode: "33000",
      socialSecurityNumber: "1 88 09 33 222 123 45",
      driverLicenseNumber: "88BX54321",
      passportNumber: "19AF78901",
      issuingCountry: "France",
    },
    image: getUrl("/images/logo-cr3dential.png"),
  },
  "identity-f": {
    issuer: "did:xrp:1:rHUy4Vuc4J1sgkijpFt8QvWH9kjhksVP7y",
    type: "identity",
    fields: {
      title: "Madame",
      firstName: "Marie",
      lastName: "Laurent",
      dateOfBirth: "1992-05-15",
      country: "France",
      phoneNumber: "+33623456789",
      email: "m.laurent@orange.fr",
      address: "27 Avenue des Champs-Élysées",
      city: "Paris",
      state: "Île-de-France",
      zipCode: "75008",
      socialSecurityNumber: "2 92 05 75 333 234 56",
      driverLicenseNumber: "92PR98765",
      passportNumber: "20BG45678",
      issuingCountry: "France",
    },
    image: getUrl("/images/logo-cr3dential.png"),
  },
  "xrpl-training": {
    issuer: "did:xrp:1:r4JWSRAf1wSojHg7JEf6H9JT4eJ6tajHui",
    type: "training",
    fields: {
      name: "XRP Legder Fundamentals",
      provider: "XRPL Commons",
      location: "Paris, France",
    },
    image: getUrl("/images/logo-xrpl.webp"),
  },
  "xrpl-commons-education-week": {
    issuer: "did:xrp:1:r4JWSRAf1wSojHg7JEf6H9JT4eJ6tajHui",
    type: "training",
    fields: {
      name: "XRPL Commons Education Week",
      provider: "XRPL Commons",
      location: "Paris, France",
    },
    image: getUrl("/images/logo-xrpl.webp"),
  },
};

export const credentialOfferTypes = Object.keys(credentialOfferData);
