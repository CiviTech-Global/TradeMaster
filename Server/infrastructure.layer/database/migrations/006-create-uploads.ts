import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable('uploads', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    uploader_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mimetype: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    entity_id: {
      type: DataTypes.INTEGER,
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
  });

  await queryInterface.addIndex('uploads', ['uploader_id'], {
    name: 'uploads_uploader_id_index',
  });

  await queryInterface.addIndex('uploads', ['entity_type', 'entity_id'], {
    name: 'uploads_entity_index',
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('uploads');
};
