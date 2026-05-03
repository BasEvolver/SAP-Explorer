import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ message: "Logical DBs API Stub" });
}
