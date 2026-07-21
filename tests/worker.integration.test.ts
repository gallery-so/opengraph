import axios from 'axios';

const BASE_URL = process.env.TEST_BASE_URL ?? 'http://localhost:3000';

jest.setTimeout(60_000);

describe('Cloudflare Worker integration', () => {
  it.each([
    ['profile', '/api/og/user/oneJPEGman'],
    ['collection', '/api/og/collection/2QzRSthNb6PAZmnSnRvPAea9LPX'],
    ['fallback', '/api/og/gallery/does-not-exist-codex'],
  ])('returns a PNG for a %s preview', async (_name, path) => {
    const response = await axios.get(`${BASE_URL}${path}`, {
      responseType: 'arraybuffer',
      timeout: 55_000,
    });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
    expect(Buffer.from(response.data).subarray(1, 4).toString()).toBe('PNG');
  });

  it.each([
    ['profile', '/api/og/user/dcinvestor/fcframe'],
    ['collection', '/api/og/collection/2QzRSthNb6PAZmnSnRvPAea9LPX/fcframe'],
    [
      'community',
      '/api/og/community/Base/0x0e76013ff360eea66b19e5dce6e0c697036bc2c0/fcframe',
    ],
  ])('returns Farcaster metadata for a %s interaction', async (_name, path) => {
    const response = await axios.post(
      `${BASE_URL}${path}`,
      { untrustedData: { buttonIndex: 1 } },
      { timeout: 30_000 },
    );

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/html');
    expect(response.data).toMatch(/<meta property="fc:frame" content="vNext"\s*\/>/);
    expect(response.data).toMatch(/<meta property="fc:frame:image" content="[^"]+"\s*\/>/);
    expect(response.data).toMatch(/position=1/);
  });
});
