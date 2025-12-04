"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { PWAInstaller } from "./pwa/PWAInstaller";
import { InstallPrompt } from "./pwa/InstallPrompt";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <PWAInstaller />
      {children}
      <InstallPrompt />
    </SessionProvider>
  );
}
