module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!react-native|@react-native|expo)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/Frontend/TheCuratorsCircle/$1'
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)']
};
