import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface DonorAttributes {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DonorCreationAttributes extends Optional<DonorAttributes, 'id'> {}

export class Donor extends Model<DonorAttributes, DonorCreationAttributes> implements DonorAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public passwordHash!: string;
  public passwordSalt!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Donor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
      field: 'password_hash',
    },
    passwordSalt: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
      field: 'password_salt',
    },
  },
  {
    sequelize,
    tableName: 'donors',
    underscored: true,
    defaultScope: {
      attributes: { exclude: ['passwordHash', 'passwordSalt'] },
    },
  }
);
