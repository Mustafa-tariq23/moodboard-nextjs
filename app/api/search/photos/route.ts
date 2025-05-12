import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const page = "1";

  const query = request.headers.get("query");

  const res = await fetch(
    `https://api.unsplash.com/search/photos/?client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}&query=${query}&page=${page}`,
    {
      method: "GET",
    }
  );
  const data = await res.json();

  return NextResponse.json(data);
}