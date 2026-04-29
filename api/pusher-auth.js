import Pusher from 'pusher';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = req.body || {};
    const socketId = body.socket_id;
    const channel = body.channel_name;
    const userId = body.user_id || 'anon-' + Math.random().toString(36).substr(2, 9);
    const userName = body.user_name || 'Anonymous';
    const avatarUrl = body.avatar_url || '';

    if (!socketId || !channel) {
      return res.status(400).json({ error: 'Missing socket_id or channel_name' });
    }

    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY || process.env.VITE_PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER || process.env.VITE_PUSHER_CLUSTER,
      useTLS: true,
    });

    const auth = pusher.authorizeChannel(socketId, channel, {
      user_id: String(userId),
      user_info: { name: userName, avatar_url: avatarUrl },
    });

    return res.status(200).send(auth);
  } catch (error) {
    console.error('CRITICAL_AUTH_ERROR:', error);
    return res.status(500).json({ 
      error: 'Pusher Auth Exception', 
      message: error.message,
      stack: error.stack
    });
  }
}
