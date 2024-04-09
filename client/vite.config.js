import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { mediapipe } from "vite-plugin-mediapipe";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mediapipe()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        secure: false,
      },
    },
  },
});
