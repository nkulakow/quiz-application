jest.mock("typeorm-transactional", () => ({
  Transactional: () => () => ({}),
}));
