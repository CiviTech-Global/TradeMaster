import { DataTypes, QueryInterface } from "sequelize";

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable("messages", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "orders",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.addIndex("messages", ["sender_id"]);
  await queryInterface.addIndex("messages", ["receiver_id"]);
  await queryInterface.addIndex("messages", ["order_id"]);
  await queryInterface.addIndex("messages", ["sender_id", "receiver_id"]);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable("messages");
}
