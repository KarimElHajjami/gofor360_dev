module.exports = {
  apps: [
    {
      name: 'gofor360',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'gofor360_db',
        DB_USER: 'gofor360_admin',
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      ignore_watch: ['node_modules', 'logs', 'dist'],
      max_memory_restart: '500M',
      autorestart: true,
      pre_exec: 'npm run build',
    },
  ],
};
