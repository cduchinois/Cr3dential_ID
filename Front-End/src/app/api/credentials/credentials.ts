export const credentialOfferData: {
  [key: string]: {
    type: string;
    fields: { [key: string]: string | number };
  };
} = {
  "42-software-engineering": {
    type: "42 Software Engineering",
    fields: {
      trainingName: "Software Engineering",
      trainingProvider: "42",
      trainingLocation: "Paris, France",
    },
  },
  "easya-training": {
    type: "EasyA Training",
    fields: {
      trainingName: "Blockchain Basis",
      trainingProvider: "EasyA",
      trainingLocation: "Paris, France",
    },
  },
  "identity-m": {
    type: "Identity",
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
  },
  "identity-f": {
    type: "Identity",
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
  },
  "xrpl-training": {
    type: "XRPL Training",
    fields: {
      trainingName: "Dev Training",
      trainingProvider: "XRP Ledger",
      trainingLocation: "Paris, France",
    },
  },
};

export const credentialOfferTypes = Object.keys(credentialOfferData);
