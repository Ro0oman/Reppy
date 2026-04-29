import Pusher from 'pusher';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { socket_id: socketId, channel_name: channel } = req.body;
  const { user_id: userId, user_name: userName, avatar_url: avatarUrl } = req.query;

  // Final fallback for user data if not in query
  const finalUserId = userId || req.body.user_id || 'anonymous-' + Math.random().toString(36).substr(2, 9);
  const finalUserName = userName || req.body.user_name || 'Anonymous';
  const finalAvatarUrl = avatarUrl || req.body.avatar_url || '';

  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY || process.env.VITE_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER || process.env.VITE_PUSHER_CLUSTER,
    useTLS: true,
  });

  try {
    const auth = pusher.authorizeChannel(socketId, channel, {
      user_id: String(finalUserId),
      user_info: {
        name: finalUserName,
        avatar_url: finalAvatarUrl,
      },
    });
    res.status(200).send(auth);
  } catch (error) {
    console.error('Pusher Auth Error:', error);
    res.status(500).json({ error: error.message });
  }
}
