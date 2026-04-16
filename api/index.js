export default async function handler(req, res) {
  try {
    const { default: app } = await import('../backend/index.js');
    return app(req, res);
  } catch (error) {
    console.error("Vercel Cold Start Error:", error);
    res.status(500).json({ error: "Vercel Cold Start Error", message: error.message, stack: error.stack });
  }
}
