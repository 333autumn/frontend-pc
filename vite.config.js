import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { resolve } from 'path'

function removeModuleType() {
  let command = 'serve'
  return {
    name: 'remove-module-type',
    enforce: 'post',
    config(_, { command: cmd }) {
      command = cmd
    },
    transformIndexHtml(html) {
      if (command !== 'build') return html
      return html
        .replace(/type="module"\s*/g, '')
        .replace(/\s*crossorigin/g, '')
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  
  return {
    base: './',
    plugins: [vue(), removeModuleType()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables.scss" as *;\n`
        }
      }
    },
    build: {
      modulePreload: false,
      rollupOptions: {
        output: {
          format: 'iife',
          inlineDynamicImports: true
        }
      }
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          ws: true
        }
      }
    }
  }
})
