module.exports = {
  apps: [
    {
      name: 'FrontMapa-Seg',
      script: 'npm',
      args: 'run dev',
      watch: true, // reiniciar automáticamente la aplicación al cambiar los archivos
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
