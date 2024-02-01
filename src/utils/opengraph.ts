export const ABCDiatypeRegular = fetch(
  new URL("../assets/fonts/ABCDiatype-Regular.ttf", import.meta.url).toString(),
).then((res) => res.arrayBuffer());

export const ABCDiatypeBold = fetch(
  new URL("../assets/fonts/ABCDiatype-Bold.ttf", import.meta.url).toString(),
).then((res) => res.arrayBuffer());

export const alpinaLight = fetch(
  new URL(
   "../assets/fonts/GT-Alpina-Standard-Light.ttf",
    import.meta.url,
  ).toString(),
).then((res) => res.arrayBuffer());
