import fetch from "node-fetch";

export const handler = async (event: any) => {
  console.log("Received event", event);
  const firstCall = await fetch("https://catfact.ninja/fact");
  const firstCallJson = (await firstCall.json()) as Record<string, string>;
  console.log("First call response", firstCall.status, firstCallJson);
  const secondCall = await fetch(
    "https://api.coindesk.com/v1/bpi/currentprice.json",
  );
  const secondCallJson = (await secondCall.json()) as Record<string, string>;
  console.log("Second call response", secondCall.status, secondCallJson);
  if (
    firstCall.status !== 200 ||
    !("fact" in firstCallJson) ||
    !("length" in firstCallJson)
  ) {
    throw new Error("First call has been intercepted");
  }
  if (secondCall.status !== 404 || !("errorMessage" in secondCallJson)) {
    throw new Error("Second call has not been intercepted");
  }
};
