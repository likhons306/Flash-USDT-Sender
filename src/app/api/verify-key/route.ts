import { NextResponse } from "next/server";

const ACCESS_KEY = process.env.ACCESS_KEY || "your-secret-access-key";

export async function POST(request: Request) {
  try {
    const { accessKey } = await request.json();

    if (accessKey === ACCESS_KEY) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
