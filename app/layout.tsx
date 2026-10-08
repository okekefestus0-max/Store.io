import type { Metadata, Viewport } from "next";
import "@fontsource/fraunces/latin-500.css";
import "@fontsource/fraunces/latin-500-italic.css";
import "@fontsource/fraunces/latin-600.css";
import "@fontsource/outfit/latin-400.css";
import "@fontsource/outfit/latin-500.css";
import "@fontsource/outfit/latin-600.css";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { PluginProvider } from "@/components/Plugins";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: { default: "STYLESORT — Find It. Sort It. Wear It.", template: "%s · STYLESORT" },
  description: "Fashion that fits your style, size and budget. Shop women and men from Enugu, across Nigeria.",
  applicationName: "STYLESORT",
  icons: { icon: "/icon.svg" },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#141210",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <PluginProvider>
            <SiteShell>{children}</SiteShell>
          </PluginProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
