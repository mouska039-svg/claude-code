import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Naya — Mon espace bien-être",
    short_name: "Naya",
    description: "Votre espace bien-être personnel avec votre praticien",
    start_url: "/portal",
    display: "standalone",
    background_color: "#F5EFE6",
    theme_color: "#5C7A6B",
    icons: [
      {
        src: "/icons/naya-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/naya-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
