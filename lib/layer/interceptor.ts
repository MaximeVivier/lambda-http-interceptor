import { rest } from "msw";
import { setupServer } from "msw/node";

console.log("Executing interceptor extension code...");

const server = setupServer(
  rest.all("*", async (req) => {
    const url = req.url.toString();
    const method = req.method;
    const headers = req.headers;
    const body = await req.text();

    console.log(`request intercepted : ${method} ${url}`);

    return req.passthrough();
  }),
);

server.listen({ onUnhandledRequest: "bypass" });
