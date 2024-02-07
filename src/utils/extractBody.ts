export async function extractBody(requestBody: any) {
  const dec = new TextDecoder();
  const reader = requestBody.getReader();
  let body = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) return body;

    body = body + dec.decode(value);
  }
}
