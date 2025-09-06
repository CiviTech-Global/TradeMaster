import { Sequelize } from 'sequelize-typescript';
import { config } from './config';
import { User } from '../../domain.layer/models/user';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.host,
  port: Number(config.port),
  database: config.database,
  username: config.user,
  password: config.password,
  models: [User],
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: true,
  },
});

export { sequelize };
export default sequelize;