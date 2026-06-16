import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasFmpKey: !!process.env.FMP_API_KEY,
    anthropicKeyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 8) ?? "none",
  });
}
