import fetch from "node-fetch";
import { expect, describe, it } from "vitest";

import { TEST_ENV_VARS } from "./testEnvVars";

describe("hello function", () => {
  it("returns a 200", async () => {
    const response = await fetch(
      `${TEST_ENV_VARS.API_URL}/make-external-call`,
      {
        method: "post",
      },
    );
    expect(response.status).toBe(200);
  });
});
