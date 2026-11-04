module.exports = {
  apps: [
    {
      name: 'hof',
      script: './dist/src/main.js',
      wait_ready: true,
      kill_timeout: 600000,
    },
  ],
};
