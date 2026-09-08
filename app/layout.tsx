import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuroSync | Sound made to fit",
  description: "Adaptive auditory libraries for children with diverse learning and sensory needs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@1,2&display=swap" rel="stylesheet"></link>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const stored = window.localStorage.getItem("neurosync-theme");
                const dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
                document.documentElement.classList.toggle("dark", dark);
              } catch {
                document.documentElement.classList.remove("dark");
              }
            })();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
