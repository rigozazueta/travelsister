import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TravelSister — Find your travel sisters | by Nomara",
    template: "%s | TravelSister by Nomara",
  },
  description:
    "A women-only community for finding travel companions. Match with sisters over yoga, pilates, surf, and nervous system regulation — then meet on a Nomara trip.",
  openGraph: {
    title: "TravelSister — Find your travel sisters",
    description:
      "A women-only community for finding travel companions, by Nomara. Match over yoga, pilates, surf, and nervous system regulation — then go.",
    siteName: "TravelSister by Nomara",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf7f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Karla:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
