const FONT_BASE_URL = 'https://cdn.gallery.so/media/system/opengraph/fonts';

async function fetchFont(name: string): Promise<ArrayBuffer> {
  const response = await fetch(`${FONT_BASE_URL}/${name}`);
  if (!response.ok) {
    throw new Error(`Unable to load OpenGraph font: ${name}`);
  }
  return response.arrayBuffer();
}

export const ABCDiatypeRegular = fetchFont('ABCDiatype-Regular.ttf');
export const ABCDiatypeBold = fetchFont('ABCDiatype-Bold.ttf');
export const alpinaLight = fetchFont('GT-Alpina-Standard-Light.ttf');
export const alpinaLightItalic = fetchFont('GT-Alpina-Standard-Light-Italic.ttf');
