import { MockConfig } from "./types";

export const responseIsValid = (
  response: MockConfig["response"],
): response is
  | {
      passThrough: true;
    }
  | {
      status: number;
      body?: string;
      headers?: Record<string, string>;
    } => {
  if (response.passThrough) {
    return true;
  }
  if (response.status === undefined) {
    return false;
  }
  return true;
};

export const responseIsResponse = (
  response: MockConfig["response"],
): response is {
  status: number;
  body?: string;
  headers?: Record<string, string>;
} => {
  if (response.passThrough) {
    return false;
  }
  return responseIsValid(response);
};
