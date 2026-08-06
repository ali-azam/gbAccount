const { spawn, exec } = require('child_process');

// Start the Next.js dev server
const devProcess = spawn('npx', ['next', 'dev'], { shell: true, stdio: 'inherit' });

// Wait 1.5 seconds for Next.js to start up, then open the browser automatically
setTimeout(() => {
  const url = 'http://localhost:3000';
  const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${startCmd} ${url}`);
}, 1500);
