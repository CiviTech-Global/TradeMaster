import 'reflect-metadata';
import dotenv from 'dotenv';
import { runMigrations, rollbackMigrations, getMigrationStatus } from '../infrastructure.layer/database/migrator';
import { sequelize } from '../infrastructure.layer/database/sequelize';

dotenv.config();

const command = process.argv[2];

const main = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    switch (command) {
      case 'up':
        await runMigrations();
        break;
      case 'down':
        const migrationName = process.argv[3];
        await rollbackMigrations(migrationName);
        break;
      case 'status':
        const status = await getMigrationStatus();
        console.log('Migration Status:');
        console.log('Executed:', status.executed);
        console.log('Pending:', status.pending);
        break;
      default:
        console.log('Usage: tsx scripts/db-migrate.ts <up|down|status> [migration-name]');
        console.log('  up                    - Run pending migrations');
        console.log('  down [migration-name] - Rollback migrations');
        console.log('  status                - Show migration status');
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

main();