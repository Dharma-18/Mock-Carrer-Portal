const localtunnel = require('localtunnel');

(async () => {
  try {
    console.log('Connecting to localtunnel over standard HTTPS (port 443)...');
    const tunnel = await localtunnel({ port: 3000 });
    console.log('================================================================');
    console.log('🌐 PUBLIC TUNNEL ACTIVE:');
    console.log('🔗 URL: ' + tunnel.url);
    console.log('================================================================');

    tunnel.on('close', () => {
      console.log('Tunnel closed');
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
    });
  } catch (err) {
    console.error('Failed to start tunnel:', err);
  }
})();
