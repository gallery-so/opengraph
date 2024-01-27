import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from '@vercel/og';
import { fetchWithJustQueryText } from '../fetch';
import { postIdQuery } from '../queries/postIdOpengraphQuery';


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

export const config = {
  runtime: 'edge',
};

const handler = async (request: NextRequest, res: NextResponse) => {
  const { searchParams } = new URL(request.url);
/*
   if (!path) {
     res.status(400).json({ error: { code: "MISSING_PATH" } });
     return;
   }
   
   
   

 
   const url = new URL(path, baseUrl);
 
   if (!url.toString().startsWith(baseUrl)) {
     res.status(400).json({ error: { code: "INVALID_PATH" } });
     return;
   }
 

 
   const fallback =
     typeof req.query.fallback === "string" ? req.query.fallback : null;
        */
 
   // default should mirror https://github.com/gallery-so/gallery/blob/main/src/constants/opengraph.ts
//  const width = parseInt(req.query.width as string) || 1200;
//   const height = parseInt(req.query.height as string) || 630;
//   const pixelDensity = parseInt(req.query.pixelDensity as string) || 2;
 
   const postId = searchParams.get('postId') ?? '';

   try {
      const queryResponse = await fetchWithJustQueryText({
         queryText: postIdQuery,
         variables: { postId: postId },
       });
     
       if (!postId || !queryResponse?.data?.post) {
         return new ImageResponse((
            <>Visit gallery.so</>
         ), {
           width: 1200,
           height: 630,
         });
       }
     
       const post = queryResponse.data.post;
       const author = post.author;
       return ( <div style={{
                display: 'flex',
                lineHeight: '32px',
              }}
            >
              <p
                style={{
                  fontFamily: "'ABCDiatype-Regular'",
                  fontSize: '25px',
                  fontWeight: 400,
                  lineHeight: '32px',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 5,
                  wordBreak: 'break-all',
                  maxWidth: '350px',
                  margin: 0,
                }}
              >
                {post?.caption}
              </p>
            </div>
            );

     
   } catch (error: unknown) {
     // TODO: log this to some error tracking service?
     console.error("error while generating opengraph image", error);
 /*
     if (fallback) {
       res.redirect(fallback);
       return;
     }
 */

     res.status(500).json({
       error: {
         code: "UNEXPECTED_ERROR",
         message: (error as any).toString(),
       },
     });
   }
 };
 
 export default handler;