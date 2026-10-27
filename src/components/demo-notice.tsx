import { useEffect, useState } from "react";

/** Inline badge marking something as demo/sample data. */
export function DemoBadge({ label = "Sample data" }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
      {label}
    </span>
  );
}

/** Banner shown on views whose content comes from sample data rather than a live API. */
export function DemoNotice({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="note"
      aria-label="Demo data notice"
      className="rounded-lg border border-border bg-secondary/60 px-4 py-3"
    >
      <p className="text-sm font-medium text-secondary-foreground">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

/** True when the app's backend environment variables are present. */
export function useSupabaseConfigured(): boolean | null {
  const [configured, setConfigured] = useState<boolean | null>(null);
  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
    setConfigured(Boolean(url && key));
  }, []);
  return configured;
}
