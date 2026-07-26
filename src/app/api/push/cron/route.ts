import { NextResponse } from "next/server";
import { scheduleExpirationNotifications } from "@/lib/actions/push";

export async function GET() {
  try {
    const result = await scheduleExpirationNotifications();

    return NextResponse.json({
      success: result.success,
      notified: result.notified || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron push error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
