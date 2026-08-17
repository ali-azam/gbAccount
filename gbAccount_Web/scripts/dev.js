const { spawn, exec } = require('child_process');
const net = require('net');

// Start the Next.js dev server
const devProcess = spawn('npx', ['next', 'dev'], { shell: true, stdio: 'inherit' });

const port = 3000;
const url = `http://localhost:${port}`;

function checkPortAndOpen() {
  const socket = new net.Socket();
  socket.setTimeout(200);

  socket.on('connect', () => {
    socket.destroy();
    // Port is ready! Open the browser.
    const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${startCmd} ${url}`);
  });

  socket.on('error', () => {
    socket.destroy();
    setTimeout(checkPortAndOpen, 300);
  });

  socket.on('timeout', () => {
    socket.destroy();
    setTimeout(checkPortAndOpen, 300);
  });

  socket.connect(port, '127.0.0.1');
}

// Start checking after 500ms
setTimeout(checkPortAndOpen, 500);

