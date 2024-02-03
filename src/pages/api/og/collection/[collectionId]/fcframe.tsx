import { ImageResponse } from "@vercel/og";
import { fetchWithJustQueryText, getPreviewUrls } from "../../../../../fetch";
import { fcframeCollectionIdOpengraphQuery } from "../../../../../queries/fcframeCollectionIdOpengraphQuery";
import { NextApiRequest } from "next";
import {
  WIDTH_OPENGRAPH_IMAGE,
  HEIGHT_OPENGRAPH_IMAGE,
  fallbackUrl,
} from "../../../../../constants/opengraph";
import {
  ABCDiatypeRegular,
  ABCDiatypeBold,
  alpinaLight,
} from "../../../../../utils/opengraph";

export const config = {
  runtime: "edge",
};

let baseUrl = "https://gallery.so";
let apiBaseUrl = "https://gallery-opengraph.vercel.app";

// can manually set the preview URL via environment variables on vercel for the `opengraph` service
if (process.env.NEXT_PUBLIC_PREVIEW_URL) {
  baseUrl = process.env.NEXT_PUBLIC_PREVIEW_URL;
  apiBaseUrl = "https://gallery-opengraph-preview.vercel.app";
} else if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview") {
  baseUrl = "https://gallery-dev.vercel.app";
  apiBaseUrl = "https://gallery-opengraph-preview.vercel.app";
}

const getTokensToDisplay = (tokenData, position) => {
  const tokens = tokenData.map(({ token }) => {
    if (token) {
      const urls = getPreviewUrls(token.definition.media);
      return {
        src: urls?.large ?? "",
        name: token.definition.name,
        communityName: token.definition.community?.name,
      };
    }
  });

  if (!position) {
    return tokens.slice(0, 2);
  }

  const mainPosition = Number(position as string) % tokens.length;
  if (mainPosition === 0) {
    return [tokens[tokens.length - 1], ...tokens.slice(0, 2)];
  }

  const start = mainPosition - 1;
  const end = mainPosition + 2;
  let result = tokens.slice(start, end);
  if (end > tokens.length) {
    result = [...result, tokens[0]!];
  }
  return result;
};

const handler = async (req: NextApiRequest) => {
  if (req.method === "POST") {
    const urlPath = req.url ?? "";

    const url = new URL(urlPath, apiBaseUrl);
    const position = url.searchParams.get("position");
    const apiUrl = new URL(req.url ?? "", apiBaseUrl);

    console.log("body", req.body);
    const buttonIndex = req.body.untrustedData?.buttonIndex ?? req.body.option;

    console.log({ position, buttonIndex });

    let hasPrevious = true;

    // when user interacts with initial frame, no position param exists. we can therefore assume
    // they've clicked `next` since it'll be the only available option
    if (!position) {
      // set the position for the next token
      apiUrl.searchParams.set("position", "1");
      // for all other tokens, parse which button was clicked. button index of 1 means previous, 2 means next.
    } else if (buttonIndex) {
      if (Number(position) === 1) {
        // if we're on the second token and the user clicks `prev`, we should bump the user back to the first token
        // by deleting the position param so that they won't see a `prev` arrow
        if (Number(buttonIndex) === 1) {
          hasPrevious = false;
          apiUrl.searchParams.delete("position");
        }
      } else {
        // if we're further along in the collection, clicking `prev` should decrement the position
        if (Number(buttonIndex) === 1) {
          apiUrl.searchParams.set("position", `${Number(position) - 1}`);
        }
      }

      // if the user clicks `next`, we should always increment the position
      if (Number(buttonIndex) === 2) {
        apiUrl.searchParams.set("position", `${Number(position) + 1}`);
      }
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "text/html");

    return new Response(
      `
      <html>
        <meta property="fc:frame" content="vNext">
        ${hasPrevious ? '<meta property="fc:frame:button:1" content="←">' : ""}
        <meta property="fc:frame:button:${hasPrevious ? 2 : 1}" content="→">
        <meta property="fc:frame:image" content="${apiUrl}">
        <meta property="fc:frame:post_url" content="${apiUrl}">
        <body>gm</body>
      </html>
    `,
      {
        status: 200,
        headers: myHeaders,
      },
    );
  }

  try {
    const path = req.url ?? "";
    const url = new URL(path, baseUrl);
    const collectionId = url.searchParams.get("collectionId");
    const position = url.searchParams.get("position");

    const queryResponse = await fetchWithJustQueryText({
      queryText: fcframeCollectionIdOpengraphQuery,
      variables: { collectionId: collectionId ?? "" },
    });

    const ABCDiatypeRegularFontData = await ABCDiatypeRegular;
    const ABCDiatypeBoldFontData = await ABCDiatypeBold;
    const alpinaLightFontData = await alpinaLight;

    const { collection } = queryResponse.data;

    if (
      !collectionId ||
      queryResponse?.data?.__typename === "ErrCollectionNotFound" ||
      queryResponse?.data?.__typename === "ErrInvalidInput" ||
      !collection
    ) {
      return new ImageResponse(
        (
          <img
            src={fallbackUrl}
            style={{
              width: 1200,
              height: 630,
              display: "block",
              objectFit: "contain",
            }}
            alt="post"
          />
        ),
        {
          width: WIDTH_OPENGRAPH_IMAGE,
          height: HEIGHT_OPENGRAPH_IMAGE,
        },
      );
    }

    const tokensToDisplay = getTokensToDisplay(collection.tokens, position);

    const shouldHaveLeftToken = tokensToDisplay.length === 3;
    const leftToken = shouldHaveLeftToken ? tokensToDisplay?.[0] : null;
    const centerToken = tokensToDisplay?.[shouldHaveLeftToken ? 1 : 0];
    const rightToken = tokensToDisplay?.[shouldHaveLeftToken ? 2 : 1];

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            height: "100%",
            minHeight: 200,
            backgroundColor: "#ffffff",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              position: "relative",
              marginLeft: "-25%",
              filter: "blur(6px)",
              opacity: 0.26,
            }}
          >
            {leftToken ? (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <img
                  width="500"
                  src={leftToken?.src}
                  style={{
                    maxWidth: "500px",
                    maxHeight: "500px",
                    display: "block",
                    objectFit: "contain",
                  }}
                  alt="post"
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    filter: "blur(2px)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'ABCDiatype-Regular'",
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      margin: 0,
                    }}
                  >
                    {leftToken?.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "'ABCDiatype-Bold'",
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      margin: 0,
                    }}
                  >
                    {leftToken?.communityName}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",

              position: "absolute",
              width: "100%",

              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <img
                width="500"
                src={centerToken?.src}
                style={{
                  maxWidth: "500px",
                  maxHeight: "500px",
                  display: "block",
                  objectFit: "contain",
                }}
                alt="post"
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                <p
                  style={{
                    fontFamily: "'ABCDiatype-Regular'",
                    fontSize: "14px",
                    fontWeight: "light",
                    lineHeight: "20px",
                    margin: 0,
                  }}
                >
                  {centerToken?.name}
                </p>
                <p
                  style={{
                    fontFamily: "'ABCDiatype-Bold'",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    margin: 0,
                  }}
                >
                  {centerToken?.communityName}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              position: "relative",
              marginRight: "-25%",
              filter: "blur(6px)",
              opacity: 0.26,
            }}
          >
            {rightToken ? (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <img
                  width="500"
                  src={rightToken?.src}
                  style={{
                    maxWidth: "500px",
                    maxHeight: "500px",
                    display: "block",
                    objectFit: "contain",
                  }}
                  alt="post"
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    filter: "blur(2px)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'ABCDiatype-Regular'",
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      margin: 0,
                    }}
                  >
                    {rightToken?.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "'ABCDiatype-Bold'",
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      margin: 0,
                    }}
                  >
                    {rightToken?.communityName}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ),
      {
        width: WIDTH_OPENGRAPH_IMAGE,
        height: HEIGHT_OPENGRAPH_IMAGE,
        fonts: [
          {
            name: "ABCDiatype-Regular",
            data: ABCDiatypeRegularFontData,
            weight: 400,
          },
          {
            name: "ABCDiatype-Bold",
            data: ABCDiatypeBoldFontData,
            weight: 700,
          },
          {
            name: "GT Alpina",
            data: alpinaLightFontData,
            style: "normal",
            weight: 500,
          },
        ],
      },
    );
  } catch (e) {
    console.log("error: ", e);
  }
};

export default handler;
