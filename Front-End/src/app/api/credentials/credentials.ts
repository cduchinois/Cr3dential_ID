import { StaticImageData } from "next/image";

import { getUrl } from "@/lib/utils";

export const credentialOfferData: {
  [key: string]: {
    type: string;
    fields: { [key: string]: string | number };
    expiresInDays?: number;
    image?: string | StaticImageData;
  };
} = {
  "42-software-engineering": {
    type: "training",
    fields: {
      name: "Software Engineering",
      provider: "42",
      location: "Paris, France",
    },
    image: getUrl("/images/logo-42.webp"),
  },
  "easya-training": {
    type: "training",
    fields: {
      name: "Blockchain Basis",
      provider: "EasyA",
      location: "Paris, France",
    },
    image: getUrl("/images/logo-easya.jpg"),
  },
  "futureverse-training-dev": {
    type: "training",
    fields: {
      name: "Developer Training",
      provider: "Futureverse",
      location: "Paris, France",
    },
    image: getUrl("/images/logo-futureverse.png"),
  },
  "identity-m": {
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
    type: "training",
    fields: {
      name: "XRP Legder Fundamentals",
      provider: "XRPL Commons",
      location: "Paris, France",
    },
    image: getUrl("/images/logo-xrpl.webp"),
  },
  "xrpl-commons-education-week": {
    type: "training",
    fields: {
      name: "XRP Ledger Education Week - Building on XRP Ledger",
      provider: "XRPL Commons",
      location: "Paris, France",
      date: "4-7 November 2024",
    },
    image: getUrl("/images/logo-xrpl-commons.jpg"),
  },
  "xrpl-commons-unesco-blockchain-for-impact": {
    type: "training",
    fields: {
      name: "Blockchain for Impact - Innovating the Social Economy Hackathon",
      provider: "XRPL Commons x UNESCO",
      location: "Paris, France",
      date: "8-10 November 2024",
    },
    image: getUrl("/images/logo-xrpl-commons.jpg"),
  },
};

export const credentialOfferTypes = Object.keys(credentialOfferData);
