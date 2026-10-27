import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sprout, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Co-Parent" },
      {
        name: "description",
        content: "Choose a new password for your Co-Parent account.",
      },
      { property: "og:title", content: "Set a new password — Co-Parent" },
      {
        property: "og:description",
        content: "Choose a new password for your Co-Parent account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type Values = z.infer<typeof schema>;

function ResetPasswordPage() {
  const [recovery, setRecovery] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  useEffect(() => {
    // The recovery link arrives as a hash-borne session (type=recovery).
    const hash = window.location.hash;
    setRecovery(hash.includes("type=recovery"));
  }, []);

  async function onSubmit(values: Values) {
    setBusy(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      // Recovery sessions are exempt from current-password checks.
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) {
        toast.error(error.message);
        return;
      }
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center px-5 py-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sprout className="size-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Co-Parent</span>
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-16">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Set a new password</CardTitle>
            <CardDescription>
              Choose a new password for your Co-Parent account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recovery === false ? (
              <p className="text-sm text-muted-foreground">
                This page only works from a password reset email link.{" "}
                <Link to="/auth" className="text-primary underline-offset-4 hover:underline">
                  Back to sign in
                </Link>
              </p>
            ) : done ? (
              <div className="space-y-3 text-sm">
                <p>Your password has been updated.</p>
                <Button asChild>
                  <Link to="/dashboard">Go to your dashboard</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={form.formState.errors.password ? true : undefined}
                    aria-describedby={
                      form.formState.errors.password ? "new-password-error" : undefined
                    }
                    {...form.register("password")}
                  />
                  {form.formState.errors.password && (
                    <p id="new-password-error" className="text-xs text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  Update password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
