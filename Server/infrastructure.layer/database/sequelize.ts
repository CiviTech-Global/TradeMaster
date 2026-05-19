import { Sequelize } from 'sequelize-typescript';
import { config } from './config';
import { User } from '../../domain.layer/models/user';
import { Business } from '../../domain.layer/models/business';
import { Category } from '../../domain.layer/models/category';
import { Upload } from '../../domain.layer/models/upload';
import { Product, ProductImage, ProductVariant } from '../../domain.layer/models/product';
import { Order, OrderItem } from '../../domain.layer/models/order';
import { Message } from '../../domain.layer/models/message';
import { Review } from '../../domain.layer/models/review';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.host,
  port: Number(config.port),
  database: config.database,
  username: config.user,
  password: config.password,
  models: [User, Business, Category, Upload, Product, ProductImage, ProductVariant, Order, OrderItem, Message, Review],
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