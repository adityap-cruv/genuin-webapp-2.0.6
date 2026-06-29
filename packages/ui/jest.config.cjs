module.exports = {
  testEnvironment: "jsdom",
  // Only run source tests. Without this, a prior `tsc --build` (typecheck)
  // emits compiled `*.test.js` into dist/types, which Jest would then try to
  // run and fail to parse.
  roots: ["<rootDir>/src"],
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/dist/"],
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
