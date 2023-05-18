export default {
  root: 'src',
  publicDir: '../public',
  base: './',
  server: {
      host: true
  },
  build: {
      outDir: '../docs',
      emptyOutDir: true,
      sourcemap: true
  },
  plugins: [
  ]
}