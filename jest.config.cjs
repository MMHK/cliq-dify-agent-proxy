/**
 * @type {import('jest').Config}
 */
const config = {
    testEnvironment: "node",
    setupFiles: ['<rootDir>/jest.setup.mjs'],
    transform: {
        "^.+\\.(m)?js$": "babel-jest"
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
    "testMatch": [
        "./**/*.test.mjs"
    ],
}

module.exports = config;
