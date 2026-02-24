import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import logger from '@/utils/logger';
import morgan from 'morgan';
import apiRoutes from '@/routes/api';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from '@/config/swagger';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(hpp());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 100 });
app.use(limiter);

app.use(express.json());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// View Engine Setup
import path from 'path';
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, '../public')));
// Routes
app.use('/api', apiRoutes);
app.get('/', (req: Request, res: Response) => {
  res.render('index', { 
    projectName: 'NodeJS Service',
    architecture: 'MVC',
    database: 'MySQL',
    communication: 'REST APIs'
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'UP' });
});

// Start Server Logic
const startServer = async () => {
    logger.info(`Server running on port ${port}`);
};

// Database Sync
const syncDatabase = async () => {
    let retries = 30;
    while (retries) {
        try {
            const sequelize = (await import('@/config/database')).default;
            await sequelize.sync();
            logger.info('Database synced');
            // Start Server after DB is ready
            app.listen(port, startServer);
            break;
        } catch (error) {
            logger.error('Error syncing database:', error);
            retries -= 1;
            logger.info(`Retries left: ${retries}`);
            await new Promise(res => setTimeout(res, 5000));
        }
    }
};

syncDatabase();
