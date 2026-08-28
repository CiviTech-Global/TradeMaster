import { sequelize } from './sequelize';
import { runMigrations } from './migrator';
import { logger } from '../utils/logger.util';

export const initializeDatabase = async (): Promise<void> => {
  try {
    logger.info('DB', 'Connecting to PostgreSQL database');

    await sequelize.authenticate();
    logger.info('DB', 'Database connection established successfully');

    logger.info('DB', 'Running database migrations');
    await runMigrations();
    logger.info('DB', 'Database migrations completed');

    logger.info('DB', 'Synchronizing models');
    await sequelize.sync({ alter: false });
    logger.info('DB', 'Database models synchronized');
    
  } catch (error) {
    logger.error('DB', 'Database initialization failed', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('DB', 'Database connection closed');
  } catch (error) {
    logger.error('DB', 'Error closing database connection', error);
  }
};

export { sequelize };
export * from './config';
export * from './driver';
export * from './migrator';