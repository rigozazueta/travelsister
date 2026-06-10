import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TravelSister by Nomara",
    short_name: "TravelSister",
    description:
      "A women-only community for finding travel sisters — match over yoga, pilates, surf, and nervous system regulation, then meet on a Nomara trip.",
    start_url: "/discover",
    display: "standalone",
    background_color: "#fbf7f1",
    theme_color: "#fbf7f1",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
