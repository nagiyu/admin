const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@admin/(.*)$": "<rootDir>/$1",
    "^@common/(.*)$": "<rootDir>/../typescript-common/common/$1",
    "^@common-mock/(.*)$": "<rootDir>/../typescript-common/tests/mock/$1",
  }
};
