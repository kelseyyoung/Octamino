import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(() => {
  // const base = command === "build" ? "/Octamino/" : "/";
  const base = "/";

  return {
    plugins: [react()],
    base,
  };
});
