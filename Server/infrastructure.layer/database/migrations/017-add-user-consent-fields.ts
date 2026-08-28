import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.addColumn('users', 'consent_given', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  await queryInterface.addColumn('users', 'consent_given_at', {
    type: DataTypes.DATE,
    allowNull: true,
  });

  await queryInterface.addColumn('users', 'privacy_policy_version', {
    type: DataTypes.STRING(50),
    allowNull: true,
  });

  await queryInterface.addColumn('users', 'terms_version', {
    type: DataTypes.STRING(50),
    allowNull: true,
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.removeColumn('users', 'consent_given');
  await queryInterface.removeColumn('users', 'consent_given_at');
  await queryInterface.removeColumn('users', 'privacy_policy_version');
  await queryInterface.removeColumn('users', 'terms_version');
};
