const { spawn } = require('child_process');

// Port is pinned so it always matches SpaProxyServerUrl in GbAccount.Api.csproj.
// Without -p, Next.js silently falls forward to 3001/3002 when 3000 is taken,
// and the SPA proxy would then wait for a server that never arrives on 3000.
//
// The browser is opened by the SPA proxy (or by `next dev` itself), not here —
// launching it from this script as well produced two tabs when started via F5.
const devProcess = spawn('npx', ['next', 'dev', '-p', '3000'], {
  shell: true,
  stdio: 'inherit',
});

devProcess.on('exit', (code) => process.exit(code ?? 0));
