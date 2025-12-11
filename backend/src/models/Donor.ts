import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface DonorAttributes {
  id: number;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DonorCreationAttributes extends Optional<DonorAttributes, 'id'> {}

export class Donor extends Model<DonorAttributes, DonorCreationAttributes> implements DonorAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
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
  },
  {
    sequelize,
    tableName: 'donors',
    underscored: true,
  }
);
