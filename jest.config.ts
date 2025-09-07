import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Donde buscar los tests
  testMatch: ["**/test/**/*.test.ts"],

  // Para ver detalles en consola
  verbose: true,

  // Evitar warnings con nodeNext/node16
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },

  // Reportes en carpeta "test/reports"
  reporters: [
    "default",
    [
      "jest-html-reporter",
      {
        pageTitle: "Auction Test Report",
        outputPath: "test/reports/test-report.html",
        includeFailureMsg: true,
        includeConsoleLog: true,
      },
    ],
  ],
};

export default config;
