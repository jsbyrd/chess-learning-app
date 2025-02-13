const Redis = jest.fn().mockImplementation(() => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  publish: jest.fn(),
  subscribe: jest.fn(),
  on: jest.fn(),
}));

export { Redis };
