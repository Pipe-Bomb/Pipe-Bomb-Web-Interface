import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pluginRewriteAll from 'vite-plugin-rewrite-all'
import webWorkerLoader from 'rollup-plugin-web-worker-loader'


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), pluginRewriteAll(), webWorkerLoader()]
})
