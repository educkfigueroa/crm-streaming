import { NextResponse } from "next/server";
import { scheduleExpiredReminder } from "@/lib/actions/push";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await scheduleExpiredReminder();

    return NextResponse.json({
      success: result.success,
      reminders: result.reminders || 0,
      expired: result.expired || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron reminder error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}