import { NextApiRequest } from 'next';
import { extractBody } from './extractBody';

export async function framePostHandler(req: NextApiRequest, isExplore?: boolean) {
  const url = new URL(req.url ?? '');
  const position = url.searchParams.get('position');
  const body = JSON.parse(await extractBody(req.body));
  const buttonIndex = body.untrustedData?.buttonIndex;

  console.log({ body, position, buttonIndex });

  let hasPrevious = true;

  // when user interacts with initial frame, no position param exists. we can therefore assume
  // they've clicked `next` since it'll be the only available option
  if (!position) {
    // set the position for the next token
    url.searchParams.set('position', '1');

    const headers = new Headers();
    headers.append('Content-Type', 'text/html');

    // for all other tokens:
    // buttonIndex=1 maps to previous
    // buttonIndex=2 maps to next
  } else if (buttonIndex) {
    // if we're on the second token and the user clicks `prev`, we should bump the user back to the first token
    // by deleting the position param so they won't see a `prev` arrow
    if (Number(position) === 1 && Number(buttonIndex) === 1) {
      hasPrevious = isExplore ?? false;
      url.searchParams.delete('position');

      const headers = new Headers();
      headers.append('Content-Type', 'text/html');

      return new Response(
        `
      <html>
        <meta property="fc:frame" content="vNext">
        <meta property="fc:frame:button:1" content="EXPLORE">
        <meta property="fc:frame:image" content="${url}">
        <meta property="fc:frame:post_url" content="${url}">
        <body>gm</body>
      </html>
    `,
        {
          status: 200,
          headers,
        },
      );
    } else if (Number(buttonIndex) === 1) {
      // `prev` should decrement the position
      url.searchParams.set('position', `${Number(position) - 1}`);
    }

    // `next` should increment the position
    if (Number(buttonIndex) === 2) {
      // if the position is incremented beyond the length of the set, `getTokensDisplay` will
      // handle this edge case when the image is fetched
      url.searchParams.set('position', `${Number(position) + 1}`);
    }
  }

  const headers = new Headers();
  headers.append('Content-Type', 'text/html');

  return new Response(
    `
      <html>
        <meta property="fc:frame" content="vNext">
        ${hasPrevious ? '<meta property="fc:frame:button:1" content="←">' : ''}
        <meta property="fc:frame:button:${hasPrevious ? 2 : 1}" content="→">
        <meta property="fc:frame:image" content="${url}">
        <meta property="fc:frame:post_url" content="${url}">
        <body>gm</body>
      </html>
    `,
    {
      status: 200,
      headers,
    },
  );
}
