import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import path from 'path';
import { sequelize } from './sequelize';

const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, 'migrations/*.ts'),
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
  logger: console,
});

export const runMigrations = async (): Promise<void> => {
  try {
    console.log('Running database migrations...');
    const migrations = await umzug.up();
    
    if (migrations.length === 0) {
      console.log('No migrations to run.');
    } else {
      console.log(`Successfully ran ${migrations.length} migration(s):`, 
        migrations.map(m => m.name).join(', ')
      );
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export const rollbackMigrations = async (migrationName?: string): Promise<void> => {
  try {
    console.log('Rolling back migrations...');
    const migrations = migrationName 
      ? await umzug.down({ to: migrationName })
      : await umzug.down();
    
    console.log(`Successfully rolled back ${migrations.length} migration(s):`,
      migrations.map(m => m.name).join(', ')
    );
  } catch (error) {
    console.error('Rollback failed:', error);
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