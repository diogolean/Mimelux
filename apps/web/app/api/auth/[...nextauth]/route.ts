import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error: "mock_auth_only",
      message: "Auth.js será conectado ao serviço /v1/auth após o protótipo.",
    },
    { status: 501 },
  );
}

export const POST = GET;
