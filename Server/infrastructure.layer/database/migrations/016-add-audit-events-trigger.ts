import { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION prevent_audit_mutation()
    RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      RAISE EXCEPTION 'audit_events is append-only: % is not allowed', TG_OP;
    END;
    $$;
  `);

  await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS no_audit_mutation ON audit_events;
    CREATE TRIGGER no_audit_mutation
    BEFORE UPDATE OR DELETE ON audit_events
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();
  `);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS no_audit_mutation ON audit_events;
  `);
};
