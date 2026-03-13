module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || "ap-api",
      cwd: __dirname,
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: process.env.NODE_ENV || "production",
      },
    },
  ],
};
