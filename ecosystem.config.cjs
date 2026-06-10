/** PM2 — GCP VM 開発環境（本番は Vercel） */
module.exports = {
  apps: [
    {
      name: 'ai-media-dev',
      cwd: __dirname,
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,
    },
    {
      name: 'dev-console-tunnel',
      cwd: __dirname,
      script: 'scripts/vm/cloudflared-tunnel.sh',
      interpreter: 'bash',
      max_restarts: 20,
      min_uptime: '5s',
      restart_delay: 3000,
    },
  ],
};
