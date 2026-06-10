import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/manrope";
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
  themeColor: "#faf8f3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
