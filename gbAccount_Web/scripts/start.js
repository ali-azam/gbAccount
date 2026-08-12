const { spawn, exec } = require('child_process');

// Start the Next.js production server
const startProcess = spawn('npx', ['next', 'start'], { shell: true, stdio: 'inherit' });

// Wait 1 second for the server to spin up, then open the browser automatically
setTimeout(() => {
  const url = 'http://localhost:3000';
  const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${startCmd} ${url}`);
}, 1000);
