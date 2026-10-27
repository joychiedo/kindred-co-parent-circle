import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DemoBadge, useSupabaseConfigured } from "@/components/demo-notice";

type AuthMode = "signin" | "signup" | "forgot";

interface AuthSearch {
  mode?: string;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: typeof search["mode"] === "string" ? search["mode"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Co-Parent" },
      {
        name: "description",
        content: "Sign in to your Co-Parent account, or create a new one.",
      },
      { property: "og:title", content: "Sign in — Co-Parent" },
      {
        property: "og:description",
        content: "Sign in to your Co-Parent account, or create a new one.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signUpSchema = signInSchema;

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;
type ForgotValues = z.infer<typeof forgotSchema>;

function AuthPage() {
  const { mode: searchMode } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>(
    searchMode === "signup" || searchMode === "forgot" ? searchMode : "signin",
  );
  const [busy, setBusy] = useState<null | "signin" | "signup" | "forgot" | "google" | "lovable">(
    null,
  );
  const [signedUp, setSignedUp] = useState(false);
  const configured = useSupabaseConfigured();

  // Stay in sync when the link carries a mode (e.g. from the landing page).
  useEffect(() => {
    if (searchMode === "signup" || searchMode === "forgot") setMode(searchMode);
  }, [searchMode]);

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "" },
  });
  const forgotForm = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  function getClient() {
    // The generated client throws a clear error when env vars are missing.
    // We surface that as a setup state instead of a crash.
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return { ok: true as const };
    } catch {
      return { ok: false as const };
    }
  }

  async function loadClient() {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      return supabase;
    } catch {
      return null;
    }
  }

  async function onSignIn(values: SignInValues) {
    if (!getClient().ok) return;
    setBusy("signin");
    const supabase = await loadClient();
    if (!supabase) {
      setBusy(null);
      toast.error("The app backend isn't connected yet. See the setup note below.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword(values);
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    await navigate({ to: "/dashboard" });
  }

  async function onSignUp(values: SignUpValues) {
    setBusy("signup");
    const supabase = await loadClient();
    if (!supabase) {
      setBusy(null);
      toast.error("The app backend isn't connected yet. See the setup note below.");
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      await navigate({ to: "/dashboard" });
      return;
    }
    // Email confirmation is on: the user isn't signed in until they confirm.
    setSignedUp(true);
  }

  async function onForgot(values: ForgotValues) {
    setBusy("forgot");
    const supabase = await loadClient();
    if (!supabase) {
      setBusy(null);
      toast.error("The app backend isn't connected yet. See the setup note below.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your email for a reset link.");
    setMode("signin");
  }

  async function onSocial(provider: "google" | "lovable") {
    setBusy(provider);
    const supabase = await loadClient();
    if (!supabase) {
      setBusy(null);
      toast.error("The app backend isn't connected yet. See the setup note below.");
      return;
    }
    try {
      const { lovable } = await import("@/integrations/lovable");
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Sign-in failed");
      }
      if (result.redirected) return; // browser is heading to the provider
      setBusy(null);
    } catch {
      setBusy(null);
      toast.error("Sign-in isn't available right now.");
    }
  }

  if (configured === false) {
    return (
      <SetupNotice />
    );
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
        {signedUp ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Check your email</CardTitle>
              <CardDescription>
                We sent a confirmation link to <strong>{signUpForm.getValues("email")}</strong>.
                Click it to activate your account, then sign in here.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" onClick={() => setSignedUp(false)}>
                Back to sign in
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </CardTitle>
              <CardDescription>
                {mode === "signup"
                  ? "Your family profiles stay private to your account."
                  : "Sign in to your Co-Parent account."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === "signin" && (
                <form
                  onSubmit={signInForm.handleSubmit(onSignIn)}
                  className="space-y-4"
                  noValidate
                >
                  <EmailField
                    id="signin-email"
                    label="Email"
                    error={signInForm.formState.errors.email?.message}
                    registration={signInForm.register("email")}
                  />
                  <PasswordField
                    id="signin-password"
                    label="Password"
                    autoComplete="current-password"
                    error={signInForm.formState.errors.password?.message}
                    registration={signInForm.register("password")}
                  />
                  <Button type="submit" className="w-full" disabled={busy !== null}>
                    {busy === "signin" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                    Sign in
                  </Button>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="block w-full text-center text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </button>
                </form>
              )}

              {mode === "signup" && (
                <form
                  onSubmit={signUpForm.handleSubmit(onSignUp)}
                  className="space-y-4"
                  noValidate
                >
                  <EmailField
                    id="signup-email"
                    label="Email"
                    error={signUpForm.formState.errors.email?.message}
                    registration={signUpForm.register("email")}
                  />
                  <PasswordField
                    id="signup-password"
                    label="Password"
                    autoComplete="new-password"
                    error={signUpForm.formState.errors.password?.message}
                    registration={signUpForm.register("password")}
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll email you a confirmation link before your account is activated.
                  </p>
                  <Button type="submit" className="w-full" disabled={busy !== null}>
                    {busy === "signup" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                    Create account
                  </Button>
                </form>
              )}

              {mode === "forgot" && (
                <form
                  onSubmit={forgotForm.handleSubmit(onForgot)}
                  className="space-y-4"
                  noValidate
                >
                  <EmailField
                    id="forgot-email"
                    label="Email"
                    error={forgotForm.formState.errors.email?.message}
                    registration={forgotForm.register("email")}
                  />
                  <Button type="submit" className="w-full" disabled={busy !== null}>
                    {busy === "forgot" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                    Send reset link
                  </Button>
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="block w-full text-center text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Back to sign in
                  </button>
                </form>
              )}

              {mode !== "forgot" && (
                <>
                  <div className="relative py-1 text-center">
                    <span className="relative z-10 bg-card px-2 text-xs text-muted-foreground">
                      or continue with
                    </span>
                    <span className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden="true" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={busy !== null}
                    onClick={() => void onSocial("google")}
                  >
                    {busy === "google" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                    Continue with Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={busy !== null}
                    onClick={() => void onSocial("lovable")}
                  >
                    {busy === "lovable" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                    Continue with Lovable
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    {mode === "signin" ? "New here? " : "Already have an account? "}
                    <button
                      type="button"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                      onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                    >
                      {mode === "signin" ? "Create an account" : "Sign in"}
                    </button>
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Co-Parent is a portfolio demo. Demo replies and charts use clearly labelled sample data.
        </p>
      </main>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-display">Setup needed</CardTitle>
          <CardDescription>
            The app backend isn't connected in this environment yet. Once the backend is enabled
            and its environment variables are present, sign-in and family profiles will work
            automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DemoBadge label="Setup state" />
        </CardContent>
      </Card>
    </div>
  );
}

function EmailField({
  id,
  label,
  error,
  registration,
}: {
  id: string;
  label: string;
  error?: string;
  registration: Record<string, unknown>;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="email"
        autoComplete="email"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...registration}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  id,
  label,
  error,
  registration,
  autoComplete,
}: {
  id: string;
  label: string;
  error?: string;
  registration: Record<string, unknown>;
  autoComplete: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="password"
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...registration}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
