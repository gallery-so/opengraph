import { ImageResponse } from '@vercel/og';
import { fetchWithJustQueryText, getPreviewUrls } from '../../../../fetch';
import { usernameOpengraphQuery } from '../../../../queries/usernameOpengraphQuery';
import { NextRequest } from 'next/server';
import { openBracket } from '../../../../assets/svg/OpenBracket';
import { WIDTH_OPENGRAPH_IMAGE, HEIGHT_OPENGRAPH_IMAGE } from '../post/[postId]';

export const config = {
  runtime: 'edge',
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
  new URL('../../../../assets/fonts/ABCDiatype-Regular.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

const ABCDiatypeBold = fetch(
  new URL('../../../../assets/fonts/ABCDiatype-Bold.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

const alpinaLight = fetch(
  new URL('../../../../assets/fonts/GT-Alpina-Standard-Light.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

export default async function handler(request: NextRequest){ 
  try {
      const path = request.nextUrl;
      const url = new URL(path, baseUrl);
      const username = url.searchParams.get("username");
      let postImageUrl =
      'https://assets.gallery.so/https%3A%2F%2Fstorage.googleapis.com%2Fprod-token-content%2F4-292cd-KT1EfsNuqwLAWDd3o4pvfUx1CAh5GMdTrRvr-image?auto=compress%2Cformat&fit=max&glryts=1705844681&w=1024&s=9076d07060aeb7ac31297a0381bd0ed3';
  
      
      const queryResponse = await fetchWithJustQueryText({
        queryText: usernameOpengraphQuery,
        variables: { username: username ?? '' },
      });
      
      const ABCDiatypeRegularFontData = await ABCDiatypeRegular;
      const ABCDiatypeBoldFontData = await ABCDiatypeBold;
      const alpinaLightFontData = await alpinaLight;
      
      const { user } = queryResponse.data;
      if (!user) {
        return new ImageResponse((
           <div>Visit gallery.so</div>
        ), {
          width: 1200,
          height: 630,
        });
      }
      const description = user.bio.split('\n')[0];
      const nonEmptyGalleries = user.galleries?.filter((gallery) =>
        gallery?.collections?.some((collection) => collection?.tokens?.length)
      );
      
      const imageUrls = nonEmptyGalleries?.[0]?.collections
          ?.filter((collection) => !collection?.hidden)
          .flatMap((collection) => collection?.tokens)
          .map((galleryToken) => {
            //console.log("token", galleryToken?.token);
            //console.log("previewUrls", getPreviewUrls(galleryToken.token.definition.media));
            return galleryToken?.token
              ? getPreviewUrls(galleryToken.token.definition.media)
              : null;
          })
          .map((result) => {
              return result?.large ?? "";
          }).slice(0, 4);
          console.log("imageUrls", imageUrls);

      if (!username || !queryResponse?.data?.user) {
         return new ImageResponse((
            <div>Visit gallery.so</div>
         ), {
           width: 1200,
           height: 630,
         });
       }
       
       return new ImageResponse((
         <div style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          minHeight: 200,
          backgroundColor: "#ffffff",
         }}>
          <div style={{display: "flex", gap: 25, justifyContent: "center", alignItems: "center", height: "87%"}}>
          <svg
         style={{ width: '36px', height: '121px' }}
         width="40"
         height="121"
         viewBox="0 0 36 121"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
       >
         <path
           d="M33.3845 120.5C-4.79681 97.5124 -11.3149 43.5986 19.4718 11.6054C22.5802 8.39033 25.9865 5.47922 29.6447 2.91146C30.5382 2.3054 32.4485 1.05912 33.3845 0.500008L35.0311 3.09922C16.1957 15.7113 4.47411 37.8411 4.63154 60.5C4.47411 83.159 16.1957 105.314 35.0311 117.901L33.3845 120.5Z"
           fill="#141414"
         />
       </svg>
       
       {imageUrls.map((url) => {
        return url ? (
          <img
          key={url ? url :"2"}
        width="370"
        src={url}
        style={{
          maxWidth: '190px',
          maxHeight: '190px',
          display: 'block',
          objectFit: "contain"
        }}
        alt="post"
      />
        ) : null;
       })
      }
       <svg
        style={{ width: '36px', height: '121px' }}
        width="20"
        height="194"
        viewBox="0 0 36 121"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.61129 0.500008C40.7972 23.4876 47.3153 77.4014 16.5284 109.395C13.4189 112.609 10.0126 115.52 6.35534 118.089C5.4576 118.695 3.55158 119.941 2.61555 120.5L0.968933 117.901C19.8045 105.289 31.5261 83.159 31.3687 60.5C31.5261 37.8411 19.8045 15.7113 0.968933 3.09922L2.61129 0.500008Z"
          fill="#141414"
        />
      </svg>
      </div>
      <div style={{
          display: "flex",
          flexDirection: "column",
          marginLeft: 25,
         }}>
        <p
                style={{
                  fontFamily: "'GT Alpina'",
                  fontSize: "32px",
                  fontWeight: 400,
                  lineHeight: "36px",
                  letterSpacing: "0px",
                  margin: 0,
                }}
              >
                {username}
              </p>
              {description && (<p
                style={{
                  fontFamily: "'ABCDiatype-Regular'",
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  margin: 0,
                }}
              >
                {description}
              </p>)}
      </div>
       </div>
       ), {
         width: WIDTH_OPENGRAPH_IMAGE,
         height: HEIGHT_OPENGRAPH_IMAGE,
         fonts: [
           {
             name: 'ABCDiatype-Regular',
             data: ABCDiatypeRegularFontData,
             weight: 400,
           },
           {
             name: 'ABCDiatype-Bold',
             data: ABCDiatypeBoldFontData,
             weight: 700,
           },
           {
             name: 'GT Alpina',
             data: alpinaLightFontData,
             style: 'normal',
             weight: 500,
           },
         ],
       });
  } catch(e) {
    console.log("error: ", e);
  }
};
