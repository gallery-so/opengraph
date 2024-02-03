import { NextApiRequest } from "next";

export async function extractBody(request: NextApiRequest) {
  const dec = new TextDecoder();
  const reader = request.body.getReader();
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) return body;

    body = body + dec.decode(value);
  }
}
