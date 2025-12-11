import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import { Influencer } from './Influencer';

export type CampaignStatus = 'active' | 'completed' | 'cancelled';

interface CampaignAttributes {
  id: number;
  influencerId: number;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  status: CampaignStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CampaignCreationAttributes extends Optional<CampaignAttributes, 'id' | 'description' | 'currentAmount' | 'status'> {}

export class Campaign extends Model<CampaignAttributes, CampaignCreationAttributes> implements CampaignAttributes {
  public id!: number;
  public influencerId!: number;
  public title!: string;
  public description!: string;
  public goalAmount!: number;
  public currentAmount!: number;
  public status!: CampaignStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Campaign.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    influencerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'influencer_id',
      references: {
        model: Influencer,
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    goalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'goal_amount',
    },
    currentAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: 'current_amount',
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    tableName: 'campaigns',
    underscored: true,
  }
);

Campaign.belongsTo(Influencer, { foreignKey: 'influencerId', as: 'influencer' });
Influencer.hasMany(Campaign, { foreignKey: 'influencerId', as: 'campaigns' });
