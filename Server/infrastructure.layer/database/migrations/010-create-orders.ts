import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable('orders', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    order_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shipping_latitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    shipping_longitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancelled_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    shipped_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
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

  await queryInterface.addIndex('orders', ['buyer_id'], {
    name: 'orders_buyer_id_index',
  });

  await queryInterface.addIndex('orders', ['business_id'], {
    name: 'orders_business_id_index',
  });

  await queryInterface.addIndex('orders', ['status'], {
    name: 'orders_status_index',
  });

  await queryInterface.addIndex('orders', ['order_number'], {
    name: 'orders_order_number_index',
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('orders');
};
