export default async function handler(req, res) {
    try {
        // Dynamically import the app to catch top-level errors in server.js
        const module = await import('../server.js');
        const app = module.default;
        return app(req, res);
    } catch (error) {
        console.error("=== SERVER STARTUP ERROR ===");
        console.error("Error Message:", error.message);
        console.error("Error Name:", error.name);
        console.error("Stack Trace:", error.stack);
        console.error("Environment Check:", {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL,
            MONGODB_URI_SET: !!process.env.MONGODB_URI,
            JWT_SECRET_SET: !!process.env.JWT_SECRET,
            CORS_ORIGIN_SET: !!process.env.CORS_ORIGIN
        });

        return res.status(500).json({
            error: "Server Startup Failed",
            message: error.message,
            details: error.name,
            // Only show stack trace in development
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
            env: {
                NODE_ENV: process.env.NODE_ENV,
                VERCEL: process.env.VERCEL,
                MONGODB_URI_SET: !!process.env.MONGODB_URI,
                JWT_SECRET_SET: !!process.env.JWT_SECRET
            }
        });
    }
}
