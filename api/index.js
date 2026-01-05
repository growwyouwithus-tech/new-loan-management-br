export default async function handler(req, res) {
    try {
        // Dynamically import the app to catch top-level errors in server.js
        const module = await import('../server.js');
        const app = module.default;
        return app(req, res);
    } catch (error) {
        console.error("Server Import/Startup Failed:", error);
        return res.status(500).json({
            error: "Server Startup Failed",
            message: error.message,
            stack: error.stack,
            env: {
                NODE_ENV: process.env.NODE_ENV,
                VERCEL: process.env.VERCEL,
                MONGODB_URI_SET: !!process.env.MONGODB_URI
            }
        });
    }
}
