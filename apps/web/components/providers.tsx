"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { refreshSession } from "@/lib/session";

function SessionBootstrap() {
  useEffect(() => {
    void refreshSession();
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionBootstrap />
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          className: "!rounded-2xl !border-black/5 !bg-ink !text-white",
        }}
      />
    </ThemeProvider>
  );
}
