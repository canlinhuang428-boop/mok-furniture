import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOK Homeware - ตู้เหล็ก เตียงเหล็ก ของใช้บ้าน",
  description: "ร้านตู้เหล็ก เตียงเหล็ก และของใช้ในบ้าน สินค้าพร้อมส่ง ส่งฟรี ทั่วประเทศ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
