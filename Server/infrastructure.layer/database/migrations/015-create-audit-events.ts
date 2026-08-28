import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable('audit_events', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    actorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    actorType: {
      type: DataTypes.ENUM('user', 'system', 'service'),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    resource: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    resourceId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('success', 'failure'),
      allowNull: false,
    },
    context: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    diff: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await queryInterface.addIndex('audit_events', ['actorId'], {
    name: 'audit_events_actor_id_idx',
  });
  await queryInterface.addIndex('audit_events', ['action'], {
    name: 'audit_events_action_idx',
  });
  await queryInterface.addIndex('audit_events', ['resource', 'resourceId'], {
    name: 'audit_events_resource_idx',
  });
  await queryInterface.addIndex('audit_events', ['createdAt'], {
    name: 'audit_events_created_at_idx',
  });

  // Append-only protection: block UPDATE and DELETE on audit_events
  await queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION prevent_audit_mutation()
    RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      RAISE EXCEPTION 'audit_events is append-only: % is not allowed', TG_OP;
    END;
    $$;
  `);

  await queryInterface.sequelize.query(`
    CREATE TRIGGER no_audit_mutation
    BEFORE UPDATE OR DELETE ON audit_events
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();
  `);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS no_audit_mutation ON audit_events;
  `);
  await queryInterface.sequelize.query(`
    DROP FUNCTION IF EXISTS prevent_audit_mutation();
  `);
  await queryInterface.dropTable('audit_events');
};
