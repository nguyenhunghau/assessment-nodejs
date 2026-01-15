import express, { Application } from 'express';
import { json } from 'body-parser';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './util/logger';

interface CustomApp extends Application {
  closeServer?: () => void;
}

const app: CustomApp = express();

// Trust proxy to get correct IP addresses
app.set('trust proxy', true);

app.use(express.json());
app.use(json());

// Load OpenAPI specification
try {
  const openApiPath = path.join(__dirname, '..', 'openapi.yml');
  const openApiDocument = yaml.load(
    fs.readFileSync(openApiPath, 'utf8')
  ) as swaggerUi.JsonObject;

  // Serve API documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  logger.info('OpenAPI documentation loaded successfully');
} catch (error) {
  logger.error('Failed to load OpenAPI documentation', error);
}

// Root endpoint with API information
app.get('/', (req, res) => {
  res.json({
    name: 'Employee & Task Management API',
    version: '2.0.0',
    description:
      'A comprehensive employee and task management system API built with Express.js and TypeScript',
    endpoints: {
      documentation: '/api-docs',
      auth: '/auth',
      employees: '/employees',
      tasks: '/tasks',
    },
    status: 'running',
  });
});

app.use(routes);

// Middleware to log requests (only in development)
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    logger.debug('Request received', { method: req.method, url: req.url });
    next();
  });
}

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error-handling middleware - must be last
app.use(errorHandler);

// Only start the server if this file is run directly (not during tests)
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  const server = app.listen(PORT, () => {
    logger.info(`Employee & Task Management API started`, {
      port: PORT,
      env: process.env.NODE_ENV || 'development',
    });
  });

  app.closeServer = () => {
    logger.info('Shutting down server');
    server.close();
  };
}

export default app;
