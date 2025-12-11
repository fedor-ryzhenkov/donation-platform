import { Sequelize } from 'sequelize';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'database.sqlite');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export async function initDatabase(): Promise<void> {
  await sequelize.sync();
  console.log('Database synchronized');
}
