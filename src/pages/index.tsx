export default function Index() {
  return (
    <>
      <div>preview url: {process.env.NEXT_PUBLIC_PREVIEW_URL || "unset"}</div>
      <div>environment: {process.env.NEXT_PUBLIC_VERCEL_ENV || "unset"}</div>
    </>
  );
}
