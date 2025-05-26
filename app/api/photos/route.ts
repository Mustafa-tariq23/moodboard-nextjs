import { NextResponse } from "next/server";

export async function GET() {
  const page = "1";
  const limit = "30";
  const result: { id: string; urls: { regular: string }; alt_description: string }[] = [];

  const res = await fetch(
    `https://api.unsplash.com/photos/?client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}&page=${page}&per_page=${limit}`,
    {
      method: "GET",
    }
  );
  const data: Array<{ id: string; urls: { regular: string }; alt_description: string }> = await res.json();
  data.forEach((photo) => {
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