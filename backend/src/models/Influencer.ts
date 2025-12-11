import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface InfluencerAttributes {
  id: number;
  name: string;
  bio: string;
  avatarUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InfluencerCreationAttributes extends Optional<InfluencerAttributes, 'id' | 'bio' | 'avatarUrl'> {}

export class Influencer extends Model<InfluencerAttributes, InfluencerCreationAttributes> implements InfluencerAttributes {
  public id!: number;
  public name!: string;
  public bio!: string;
  public avatarUrl!: string;
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
  },
  {
    sequelize,
    tableName: 'influencers',
    underscored: true,
  }
);
