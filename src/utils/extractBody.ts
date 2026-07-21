export async function extractBody(requestBody: unknown) {
  if (typeof requestBody === 'string') return requestBody;
  if (requestBody == null) return '';

  const dec = new TextDecoder();
  if (requestBody instanceof Uint8Array) return dec.decode(requestBody);

  if (
    typeof requestBody !== 'object' ||
    !('getReader' in requestBody) ||
    typeof requestBody.getReader !== 'function'
  ) {
    return JSON.stringify(requestBody);
  }

  const reader = requestBody.getReader();
  let body = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) return body;

    body = body + dec.decode(value);
  }
}
