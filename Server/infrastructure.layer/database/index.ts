import { sequelize } from './sequelize';
import { runMigrations } from './migrator';

export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    console.log('🔄 Running database migrations...');
    await runMigrations();
    console.log('✅ Database migrations completed.');
    
    console.log('🔄 Synchronizing models...');
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synchronized.');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed.');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

export { sequelize };
export * from './config';
export * from './driver';
export * from './migrator';