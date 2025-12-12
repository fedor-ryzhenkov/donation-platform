import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface InfluencerAttributes {
  id: number;
  name: string;
  bio: string;
  avatarUrl: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InfluencerCreationAttributes extends Optional<InfluencerAttributes, 'id' | 'bio' | 'avatarUrl'> {}

export class Influencer extends Model<InfluencerAttributes, InfluencerCreationAttributes> implements InfluencerAttributes {
  public id!: number;
  public name!: string;
  public bio!: string;
  public avatarUrl!: string;
  public passwordHash!: string;
  public passwordSalt!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Influencer.init(
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
    bio: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: '',
      field: 'avatar_url',
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
    tableName: 'influencers',
    underscored: true,
    defaultScope: {
      attributes: { exclude: ['passwordHash', 'passwordSalt'] },
    },
  }
);
