import Pusher from 'pusher';

export default async function handler(req, res) {
  // 1. CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 2. Parse body if it's a string (Vercel usually parses but sometimes for certain headers it doesn't)
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // Not JSON, might be urlencoded
        const params = new URLSearchParams(body);
        body = Object.fromEntries(params.entries());
      }
    }
    
    // Ensure body is at least an empty object
    body = body || {};

    const socketId = body.socket_id;
    const channel = body.channel_name;
    const userId = body.user_id || 'anon-' + Math.random().toString(36).substr(2, 9);
    const userName = body.user_name || 'Anonymous';
    const avatarUrl = body.avatar_url || '';

    // Log request details for debugging in Vercel
    console.log('[PUSHER AUTH] Request received:', { 
      socketId, 
      channel, 
      userId, 
      userName,
      method: req.method,
      contentType: req.headers['content-type']
    });

    if (!socketId || !channel) {
      console.warn('[PUSHER AUTH] Missing socket_id or channel_name');
      return res.status(400).json({ 
        error: 'Missing socket_id or channel_name',
        received: { socketId, channel }
      });
    }

    // 3. Initialize Pusher with explicit checks
    const config = {
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY || process.env.VITE_PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER || process.env.VITE_PUSHER_CLUSTER,
      useTLS: true,
    };

    if (!config.appId || !config.secret || !config.key) {
      const missing = [];
      if (!config.appId) missing.push('PUSHER_APP_ID');
      if (!config.key) missing.push('PUSHER_KEY/VITE_PUSHER_KEY');
      if (!config.secret) missing.push('PUSHER_SECRET');
      
      console.error('[PUSHER AUTH] Missing variables:', missing);
      return res.status(500).json({ 
        error: 'Pusher Configuration Error', 
        message: `Missing: ${missing.join(', ')}`
      });
    }

    const pusher = new Pusher(config);

    // 4. Authorize the channel
    const auth = pusher.authorizeChannel(socketId, channel, {
      user_id: String(userId),
      user_info: { name: userName, avatar_url: avatarUrl },
    });

    console.log('[PUSHER AUTH] Authorization successful');
    return res.status(200).json(auth);
  } catch (error) {
    console.error('CRITICAL_AUTH_ERROR:', error);
    return res.status(500).json({ 
      error: 'Pusher Auth Exception', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
