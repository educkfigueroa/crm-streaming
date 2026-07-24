import { Tv } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-card border border-border">
            <Tv className="h-6 w-6 text-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">CRM Streaming</h1>
          <p className="text-sm text-muted-foreground">Sistema de gestión de cuentas</p>
        </div>
        {children}
      </div>
    </div>
  );
}
