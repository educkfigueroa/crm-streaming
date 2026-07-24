"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, null);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl text-foreground">Acceso Rápido</CardTitle>
        <CardDescription className="text-muted-foreground">
          Ingresa tu PIN de 6 dígitos
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500 dark:text-red-400 text-center">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="pin" className="text-foreground text-center block">
              PIN
            </Label>
            <Input
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]*"
              placeholder="••••••"
              required
              autoFocus
              className="bg-background border-border text-foreground placeholder:text-muted-foreground text-center text-2xl tracking-[0.5em] h-14 font-mono"
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium"
            disabled={isPending}
          >
            {isPending ? "Ingresando..." : "Ingresar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
