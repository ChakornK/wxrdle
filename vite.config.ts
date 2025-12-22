import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    preact({
      prerender: {
        enabled: true,
        renderTarget: "#app",
        additionalPrerenderRoutes: ["/404"],
        previewMiddlewareEnabled: true,
        previewMiddlewareFallback: "/404",
      },
    }),

    {
      name: "meta-tags",
      transformIndexHtml(html) {
        return ((
          html: string,
          { title, description }: { title: string; description: string }
        ) => {
          const metaHtml = `
		        <title>${title}</title>
		        <meta property="og:description" content="${description}">
		        <meta property="og:title" content="${title}">
		        <meta name="description" content="${description}">
		        <meta name="twitter:title" content="${title}">
		        <meta name="twitter:description" content="${description}">
		        <meta name="twitter:card" content="summary">`;
          return html.replace(/(?<=<head>)/, metaHtml);
        })(html, {
          title: "Wordle Answers",
          description: "View future Wordle answers!",
        });
      },
    },
  ],
});
