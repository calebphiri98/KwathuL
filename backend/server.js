import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import recipeRoutes from './routes/recipes.js';
import blogRoutes from './routes/blog.js';
import orderRoutes from './routes/orders.js';
import contactRoutes from './routes/contact.js';
import uploadRoutes from './routes/upload.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { issueCsrfToken, verifyCsrfToken } from './middleware/csrf.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',');

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // required so the browser sends/receives the httpOnly cookie
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(issueCsrfToken);
app.use('/api', verifyCsrfToken);
app.use('/api', generalLimiter);

// Serve uploaded images statically (used by admin-uploaded product/recipe/blog images)
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Kwathu Foods API' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong.' });
});

app.listen(PORT, () => {
  console.log(`Kwathu Foods API running on http://localhost:${PORT}`);
});