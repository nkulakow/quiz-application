// setup file for jest tests
jest.mock("typeorm-transactional", () => ({
  Transactional: () => () => ({}),
}));
