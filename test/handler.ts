import fetch from "node-fetch";

export const handler = async (event: any) => {
  console.log("Received event", event);
  const res = await fetch("https://www.google.com");
  console.log("Response", res.status, await res.text());
};
