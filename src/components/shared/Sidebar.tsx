"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Tv,
  Users,
  FileText,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { useSidebar } from "./SidebarContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cuentas", href: "/cuentas", icon: Tv },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Suscripciones", href: "/suscripciones", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col glass-strong border-r border-border/50 transition-all duration-300 md:static md:translate-x-0",
          open ? "translate-x-0 shadow-emerald-lg" : "-translate-x-full"
        )}
        style={{ paddingTop: "var(--safe-top, 0px)" }}
      >
        <div className="flex h-16 items-center gap-3 px-6 border-b border-border/50">
          <div className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 transition-all duration-300 hover:scale-110 hover:shadow-emerald hover:rotate-3">
            <Image
              src="/gstreaming.png"
              alt="CRM"
              width={28}
              height={28}
              className="rounded-lg transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div>
            <span className="text-sm font-bold text-foreground tracking-tight">CRM Streaming</span>
            <p className="text-[10px] text-muted-foreground">Panel de administración</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/5 text-foreground shadow-sm shadow-emerald/5 border border-emerald-500/10"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:translate-x-0.5"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald/10"
                    : "bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-accent"
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                {item.name}
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald/30" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/50 p-4">
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-300"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted transition-colors duration-300 group-hover:bg-red-500/10">
                <LogOut className="h-4 w-4" />
              </div>
              Cerrar Sesión
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
