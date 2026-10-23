import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuestOS | Gamified Goal & Life Leveling System",
  description: "Level up your life, defeat procrastination, and conquer micro-quests with XP, streaks, and n8n automations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-[#070b14] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
        {children}
      </body>
    </html>
  );
}
