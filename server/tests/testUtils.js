import { jest } from "@jest/globals";

export function createMockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

export function createMockNext() {
  return jest.fn();
}