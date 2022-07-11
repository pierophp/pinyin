export default async (request: Request) => {
  const url = new URL(request.url);
  const requestUrl = url.searchParams.get("url");
  if (!requestUrl) {
    return Response.json({ message: "URL is required" }, { status: 500 });
  }

  return await fetch(requestUrl, request);
};
