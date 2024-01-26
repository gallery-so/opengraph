import chromium from "@sparticuz/chromium-min";
import type { NextApiRequest, NextApiResponse } from "next";
import { Browser } from "puppeteer";
import puppeteer from "puppeteer-core";
import type { Browser as BrowserCore } from "puppeteer-core";

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

const getBrowserInstance = async () => {
  const executablePath = await chromium.executablePath(
    "https://storage.googleapis.com/gallery-prod-325303.appspot.com/dev/chromium-v117.0.0-pack.tar"
  );

  if (!executablePath) {
    // running locally
    const puppeteer = await import("puppeteer");
    return puppeteer.launch({
      args: chromium.args,
      headless: true,
      ignoreHTTPSErrors: true,
    });
  }

  return puppeteer.launch({
    executablePath,
    defaultViewport: chromium.defaultViewport,
    args: chromium.args,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const path = req.query.path as string;
  if (!path) {
    res.status(400).json({ error: { code: "MISSING_PATH" } });
    return;
  }

  const url = new URL(path, baseUrl);

  if (!url.toString().startsWith(baseUrl)) {
    res.status(400).json({ error: { code: "INVALID_PATH" } });
    return;
  }

  // s-maxage:
  //   images are considered "fresh" for 8 hours
  // stale-while-revalidate:
  //   allow serving stale images for up to 24 hours, with cache refresh in background
  //
  // anything outside this window will cause the browser to wait to regenerate the image
  // so we might consider increasing the stale-while-revalidate if we are okay with the
  // first request serving a very stale image
  res.setHeader(
    "Cache-Control",
    `s-maxage=${60 * 60 * 8}, stale-while-revalidate=${60 * 60 * 24}`
  );

  if (req.method === "POST") {
    const apiUrl = new URL(req.url ?? "", apiBaseUrl);
    console.log({ apiUrl });

    const { position } = req.query;
    const buttonIndex = req.body.untrustedData?.buttonIndex;

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

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(
      // conditionally set the previous button and its button index
      `
      <html>
        <meta property="fc:frame" content="vNext">
        ${hasPrevious ? '<meta property="fc:frame:button:1" content="←">' : ""}
        <meta property="fc:frame:button:${hasPrevious ? 2 : 1}" content="→">
        <meta property="fc:frame:image" content="${apiUrl}">
        <body>gm</body>
      </html>
      `
    );
    return;
  }

  const fallback =
    typeof req.query.fallback === "string" ? req.query.fallback : null;

  // default should mirror https://github.com/gallery-so/gallery/blob/main/src/constants/opengraph.ts
  const width = parseInt(req.query.width as string) || 1200;
  const height = parseInt(req.query.height as string) || 630;
  const pixelDensity = parseInt(req.query.pixelDensity as string) || 2;

  console.log("position", req.query.position);

  url.searchParams.set("width", width.toString());
  url.searchParams.set("height", height.toString());
  url.searchParams.set("position", req.query.position as string);

  let browser: Browser | BrowserCore | null = null;

  try {
    console.log(url);
    browser = (await getBrowserInstance()) as Browser;
    console.log(1);
    const page = await browser.newPage();
    console.log(2);
    await page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: pixelDensity,
    });
    console.log(3);
    page.setDefaultNavigationTimeout(1000 * 10);
    console.log(4);

    await page.goto(url.toString());
    console.log(5);
    await page.waitForNetworkIdle();
    console.log(6);

    console.log("waiting for selector", url.toString());

    await page.waitForSelector("#opengraph-image", { timeout: 10000 });
    console.log(7);
    const element = await page.$("#opengraph-image");
    console.log(8);

    if (!element) {
      throw new Error("No #opengraph-image element found at path");
    }
    console.log(9);

    const imageBuffer = await element.screenshot({ type: "jpeg" });
    console.log(10);

    res.setHeader("Content-Type", "image/jpeg");
    console.log(11);
    res.send(imageBuffer);
  } catch (error: unknown) {
    // TODO: log this to some error tracking service?
    console.error("error while generating opengraph image", error);

    if (fallback) {
      res.redirect(fallback);
      return;
    }

    res.status(500).json({
      error: {
        code: "UNEXPECTED_ERROR",
        message: (error as any).toString(),
      },
    });
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};

export default handler;
