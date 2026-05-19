import cors from 'cors';

export const corsMiddleware = cors({
  origin(origin, cb) {
    const allowed = [process.env.FRONTEND_URL, 'http://localhost:5173'];
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
