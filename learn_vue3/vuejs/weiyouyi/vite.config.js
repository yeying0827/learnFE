import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import autoPlugin from './src/auto-import'
import autoTryPlugin from "./src/auto-try.js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), autoPlugin(), autoTryPlugin()],
})
