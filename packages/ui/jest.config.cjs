module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test/jest.setup.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  // Mirror the path aliases declared in tsconfig.json so imports like
  // `@genuin/ui/lib/utils` resolve under Jest the same way they do under tsc.
  moduleNameMapper: {
    "^@genuin/ui$": "<rootDir>/src",
    "^@genuin/ui/(.*)$": "<rootDir>/src/$1",
  },
};
