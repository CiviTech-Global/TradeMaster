import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.addColumn('users', 'avatar', {
    type: DataTypes.STRING(500),
    allowNull: true,
  });

  await queryInterface.addColumn('users', 'phone', {
    type: DataTypes.STRING(20),
    allowNull: true,
  });

  await queryInterface.addColumn('users', 'bio', {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  await queryInterface.addColumn('users', 'default_latitude', {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  });

  await queryInterface.addColumn('users', 'default_longitude', {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.removeColumn('users', 'avatar');
  await queryInterface.removeColumn('users', 'phone');
  await queryInterface.removeColumn('users', 'bio');
  await queryInterface.removeColumn('users', 'default_latitude');
  await queryInterface.removeColumn('users', 'default_longitude');
};
