import Pusher from "pusher";
import dotenv from 'dotenv';
dotenv.config();

let pusherInstance = null;

const getPusher = () => {
  if (!pusherInstance) {
    const config = {
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY || process.env.VITE_PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER || process.env.VITE_PUSHER_CLUSTER,
      useTLS: true
    };
    
    if (!config.appId || !config.key || !config.secret) {
      console.error('[PUSHER] Initialization failed: Missing environment variables');
      return null;
    }
    
    pusherInstance = new Pusher(config);
  }
  return pusherInstance;
};

export default getPusher;
