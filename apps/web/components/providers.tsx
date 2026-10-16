"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          className: "!rounded-2xl !border-black/5 !bg-[#202027] !text-white",
        }}
      />
    </ThemeProvider>
  );
}
