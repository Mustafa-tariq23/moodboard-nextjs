import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const page = "1";
  const limit = "8";
  const result : any = [];

  const res = await fetch(
    `https://api.unsplash.com/photos/?client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}&page=${page}&per_page=${limit}`,
    {
      method: "GET",
    }
  );
  const data = await res.json();
  data.forEach((photo: any) => {
    result.push({
      id: photo.id,
      urls: {
        regular: photo.urls.regular,
      },
      alt_description: photo.alt_description,
    });
  });

  return NextResponse.json({ results: result });
}