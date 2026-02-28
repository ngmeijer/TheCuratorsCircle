// basic RN test setup
jest.useFakeTimers();

// mock expo-router for tests
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  Link: 'a',
}));
