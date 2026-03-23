import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Twitch Watchlist",
  description: "Surveille tes streamers Twitch préférés",
  icons: {
    icon: "https://assets.twitch.tv/assets/favicon-32-e29e246c157142c94346.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-100 antialiased">{children}</body>
    </html>
  );
}
