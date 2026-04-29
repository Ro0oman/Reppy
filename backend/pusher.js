import Pusher from "pusher";
import dotenv from 'dotenv';
dotenv.config();

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY || process.env.VITE_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER || process.env.VITE_PUSHER_CLUSTER,
  useTLS: true
});

export default pusher;
