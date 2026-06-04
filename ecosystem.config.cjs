/** PM2 — сервер құласа автоматты қайта іске қосады (npm install -g pm2) */
module.exports = {
  apps: [
    {
      name: 'beka-ai',
      cwd: './backend',
      script: 'server.js',
      env: {
        SERVE_FRONTEND: 'true',
        PORT: 5006,
      },
      autorestart: true,
      max_restarts: 50,
      watch: false,
    },
  ],
};
