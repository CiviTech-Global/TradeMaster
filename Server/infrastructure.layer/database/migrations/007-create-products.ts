import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable('products', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  await queryInterface.addIndex('products', ['business_id'], {
    name: 'products_business_id_index',
  });

  await queryInterface.addIndex('products', ['category_id'], {
    name: 'products_category_id_index',
  });

  await queryInterface.addIndex('products', ['is_active'], {
    name: 'products_is_active_index',
  });

  await queryInterface.addIndex('products', ['price'], {
    name: 'products_price_index',
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('products');
};
