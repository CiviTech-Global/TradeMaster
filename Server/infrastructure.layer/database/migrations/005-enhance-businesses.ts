import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.addColumn('businesses', 'description', {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  await queryInterface.addColumn('businesses', 'category_id', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  });

  await queryInterface.addColumn('businesses', 'cover_image', {
    type: DataTypes.STRING(500),
    allowNull: true,
  });

  await queryInterface.addIndex('businesses', ['category_id'], {
    name: 'businesses_category_id_index',
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.removeColumn('businesses', 'description');
  await queryInterface.removeColumn('businesses', 'category_id');
  await queryInterface.removeColumn('businesses', 'cover_image');
};
