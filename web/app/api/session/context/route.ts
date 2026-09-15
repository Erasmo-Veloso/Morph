import { NextResponse } from "next/server";
import { sendRuntimeCommand, type RuntimeCommand } from "@/lib/runtime-bridge";

const commands = new Set<RuntimeCommand>(["context:verified", "context:unverified", "context:outside"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { command?: RuntimeCommand };
  if (!body.command || !commands.has(body.command)) {
    return NextResponse.json({ error: "Invalid school context command." }, { status: 400 });
  }
  try {
    return NextResponse.json({ state: await sendRuntimeCommand(body.command) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Runtime bridge unavailable." }, { status: 503 });
  }
}
