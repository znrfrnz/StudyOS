import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/availability",
        "/dashboard",
        "/deadlines",
        "/files",
        "/flashcards",
        "/plan",
        "/quizzes",
        "/sessions",
        "/subjects",
      ],
    },
  };
}
