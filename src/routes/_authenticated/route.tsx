import { useState } from "react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppChrome } from "@/components/app-chrome";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => (
    <AppChrome>
      <Outlet />
    </AppChrome>
  ),
});
