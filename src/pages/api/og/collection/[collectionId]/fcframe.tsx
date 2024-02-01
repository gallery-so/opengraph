import { ImageResponse } from "@vercel/og";
import { fetchWithJustQueryText, getPreviewUrls } from "../../../../../fetch";
import { fcframeCollectionIdOpengraphQuery } from "../../../../../queries/fcframeCollectionIdOpengraphQuery";
import { NextRequest } from "next/server";
import {
  WIDTH_OPENGRAPH_IMAGE,
  HEIGHT_OPENGRAPH_IMAGE,
} from "../../post/[postId]";

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

const ABCDiatypeRegular = fetch(
  new URL("../../../../../assets/fonts/ABCDiatype-Regular.ttf", import.meta.url),
).then((res) => res.arrayBuffer());

const ABCDiatypeBold = fetch(
  new URL("../../../../../assets/fonts/ABCDiatype-Bold.ttf", import.meta.url),
).then((res) => res.arrayBuffer());

const alpinaLight = fetch(
  new URL(
    "../../../../../assets/fonts/GT-Alpina-Standard-Light.ttf",
    import.meta.url,
  ),
).then((res) => res.arrayBuffer());

const getTokensToDisplay = (tokenData, position) => {
   const tokens = tokenData.map(({ token }) => {
      if (token) {
         const urls = getPreviewUrls(token.definition.media)
         return {
            src: urls?.large ?? '',
            name: token.definition.name,
            communityName: token.definition.community?.name,
         };
      }
   }).slice(0, 5);
   
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
}

export default async function handler(request: NextRequest) {
  try {
    const path = request.nextUrl;
    const url = new URL(path, baseUrl);
    const collectionId = url.searchParams.get("collectionId");

    const queryResponse = await fetchWithJustQueryText({
      queryText: fcframeCollectionIdOpengraphQuery,
      variables: { collectionId: collectionId ?? "" },
    });
console.log("queryResponse", queryResponse)

    const ABCDiatypeRegularFontData = await ABCDiatypeRegular;
    const ABCDiatypeBoldFontData = await ABCDiatypeBold;
    const alpinaLightFontData = await alpinaLight;

    const { collection } = queryResponse.data;
    if (!collection) {
      return new ImageResponse(<div>Visit gallery.so</div>, {
        width: 1200,
        height: 630,
      });
    }
    
    const position = "0";
    
   
   const tokensToDisplay = getTokensToDisplay(collection.tokens, position);
   
   const shouldHaveLeftToken = tokensToDisplay ? tokensToDisplay.length === 3 : false;
   const leftToken = shouldHaveLeftToken ? tokensToDisplay?.[0] : null;
   const centerToken = tokensToDisplay?.[shouldHaveLeftToken ? 1 : 0];
   const rightToken = tokensToDisplay?.[shouldHaveLeftToken ? 2 : 1];


   if (!collectionId || !queryResponse?.data?.collection) {
      return new ImageResponse(<div>Visit gallery.so</div>, {
        width: 1200,
        height: 630,
      });
   }

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
          <div style={{
              display: "flex",
              backgroundColor: "#ffffff",
              position: "relative",
              marginLeft: "-25%",
                  filter: "blur(6px)",
                  opacity: 0.26,
            }}>
              {leftToken ? (
                <div style={{ display: "flex", flexDirection: "column"}}>
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
              <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-start"}}>
                  <p
                style={{
                  fontFamily: "'ABCDiatype-Regular'",
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  margin: 0,
                }}
              >
                {leftToken?.name}
              </p>
                  <p
                style={{
                  fontFamily: "'ABCDiatype-Bold'",
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
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
  
              gap: "8px",
              height: "100%",
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
            <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-start"}}>
                  <p
                style={{
                  fontFamily: "'ABCDiatype-Regular'",
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  margin: 0,
                }}
              >
                {centerToken?.name}
              </p>
                  <p
                style={{
                  fontFamily: "'ABCDiatype-Bold'",
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  margin: 0,
                }}
              >
                {centerToken?.communityName}
              </p>
                </div>
                
          </div>
          
          <div style={{
              display: "flex",
              backgroundColor: "#ffffff",
              position: "relative",
              marginRight: "-25%",
                  filter: "blur(6px)",
                  opacity: 0.26,
            }}>
              {rightToken ? (
                <div style={{ display: "flex", flexDirection: "column"}}>
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
              <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-start"}}>
                  <p
                style={{
                  fontFamily: "'ABCDiatype-Regular'",
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  margin: 0,
                }}
              >
                {rightToken?.name}
              </p>
                  <p
                style={{
                  fontFamily: "'ABCDiatype-Bold'",
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
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
}
