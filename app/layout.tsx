import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🎄 クリスマス ペア決めルーレット",
  description: "クリスマスパーティーのペアをルーレットで楽しく決めよう！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
