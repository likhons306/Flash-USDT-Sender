import { NextResponse } from "next/server";

const ACCESS_KEY = process.env.ACCESS_KEY;

export async function POST(request: Request) {
  if (!ACCESS_KEY) {
    return NextResponse.json(
      { success: false, error: "Access key not configured on server" },
      { status: 500 }
    );
  }

  try {
    const { accessKey } = await request.json();

    if (accessKey === ACCESS_KEY) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
