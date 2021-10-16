const { jestConfig } = require("@salesforce/sfdx-lwc-jest/config");

module.exports = {
  ...jestConfig,
  modulePathIgnorePatterns: ["<rootDir>/.localdevserver"],
  moduleNameMapper: {
    "^@salesforce/apex$": "<rootDir>/force-app/test/jest-mocks/apex",
    "^@salesforce/schema$": "<rootDir>/force-app/test/jest-mocks/schema",
    "^lightning/navigation$":
      "<rootDir>/force-app/test/jest-mocks/lightning/navigation",
    "^lightning/platformShowToastEvent$":
      "<rootDir>/force-app/test/jest-mocks/lightning/platformShowToastEvent",
    "^lightning/uiRecordApi$":
      "<rootDir>/force-app/test/jest-mocks/lightning/uiRecordApi",
    "^lightning/messageService$":
      "<rootDir>/force-app/test/jest-mocks/lightning/messageService",
    "^lightning/actions$":
      "<rootDir>/force-app/test/jest-mocks/lightning/actions"
  },
  testTimeout: 10000
};
