import { DataTypes, QueryInterface } from "sequelize";

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable("reviews", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reviewer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "businesses",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  await queryInterface.addIndex("reviews", ["reviewer_id"]);
  await queryInterface.addIndex("reviews", ["business_id"]);
  await queryInterface.addIndex("reviews", ["product_id"]);
  await queryInterface.addIndex("reviews", ["reviewer_id", "order_id"], {
    unique: true,
    where: { order_id: { $ne: null } } as any,
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable("reviews");
}
