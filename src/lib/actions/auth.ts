"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "crm_session";
const PIN = (process.env.AUTH_PIN ?? "111872").trim();

export async function signIn(prevState: unknown, formData: FormData) {
  const pin = formData.get("pin") as string;

  if (!pin) {
    return { error: "Ingresa el PIN de acceso" };
  }

  if (pin.length !== 6) {
    return { error: "El PIN debe tener 6 dígitos" };
  }

  if (pin !== PIN) {
    return { error: "PIN incorrecto" };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect("/");
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
