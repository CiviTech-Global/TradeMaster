import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import path from 'path';
import { logger } from '../utils/logger.util';
import { sequelize } from './sequelize';

const migrationsGlob = path.join(__dirname, 'migrations').replace(/\\/g, '/') + '/*.ts';

const umzug = new Umzug({
  migrations: {
    glob: migrationsGlob,
    resolve: ({ name, path: filepath, context }) => {
      const migration = require(filepath || '');
      return {
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ 
    sequelize,
    tableName: 'SequelizeMeta',
  }),
  logger: {
    info: () => {},
    debug: () => {},
    warn: () => {},
    error: (msg: string | object) => logger.warn("MIGRATE", String(msg)),
  },
});

export const runMigrations = async (): Promise<void> => {
  try {
    logger.info('MIGRATE', 'Running database migrations');
    const migrations = await umzug.up();

    if (migrations.length === 0) {
      logger.info('MIGRATE', 'No migrations to run');
    } else {
      logger.info('MIGRATE', `Successfully ran ${migrations.length} migration(s)`, {
        migrations: migrations.map(m => m.name).join(', ')
      });
    }
  } catch (error) {
    logger.error('MIGRATE', 'Migration failed', error);
    throw error;
  }
};

export const rollbackMigrations = async (migrationName?: string): Promise<void> => {
  try {
    logger.info('MIGRATE', 'Rolling back migrations');
    const migrations = migrationName
      ? await umzug.down({ to: migrationName })
      : await umzug.down();

    logger.info('MIGRATE', `Successfully rolled back ${migrations.length} migration(s)`, {
      migrations: migrations.map(m => m.name).join(', ')
    });
  } catch (error) {
    logger.error('MIGRATE', 'Rollback failed', error);
    throw error;
  }
};

export const getMigrationStatus = async () => {
  const executed = await umzug.executed();
  const pending = await umzug.pending();
  
  return {
    executed: executed.map(m => m.name),
    pending: pending.map(m => m.name),
  };
};

export { umzug };