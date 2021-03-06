module.exports = {
  'roots': ['<rootDir>/src'],
  'testMatch': [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  'transform': {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  'modulePathIgnorePatterns': [
    '<rootDir>/src/__tests__/mocks',
    '<rootDir>/src/__tests__/cleanup.ts',
  ],
  'setupFilesAfterEnv': ['<rootDir>/src/__tests__/cleanup.ts'],
};
