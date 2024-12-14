import path from "path"
import react from "@vitejs/plugin-react-swc"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {

    // Load env file from parent directory
    const env = loadEnv(mode, path.join(process.cwd(), '..'), '')
    console.log('Loaded environment:', Object.keys(env)) // Using env to avoid the error

    return {
      plugins: [react()],
      envDir: '..',
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true
          }
        }
      }
    }
})
