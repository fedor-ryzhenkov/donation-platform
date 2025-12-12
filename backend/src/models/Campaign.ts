import { DataTypes, Model, Optional, BelongsToManyAddAssociationsMixin } from 'sequelize';
import { sequelize } from '../database';
import { Influencer } from './Influencer';
import { CampaignInfluencer } from './CampaignInfluencer';

export type CampaignStatus = 'active' | 'completed' | 'cancelled';

interface CampaignAttributes {
  id: number;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  status: CampaignStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CampaignCreationAttributes
  extends Optional<CampaignAttributes, 'id' | 'description' | 'currentAmount' | 'status'> {}

export class Campaign
  extends Model<CampaignAttributes, CampaignCreationAttributes>
  implements CampaignAttributes
{
  public id!: number;
  public title!: string;
  public description!: string;
  public goalAmount!: number;
  public currentAmount!: number;
  public status!: CampaignStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // <-- Add these for TypeScript to know setCollaborators exists
  public setCollaborators!: BelongsToManyAddAssociationsMixin<Influencer, number>;
}

Campaign.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    goalAmount: { type: DataTypes.FLOAT, allowNull: false, field: 'goal_amount' },
    currentAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0, field: 'current_amount' },
    status: { type: DataTypes.ENUM('active', 'completed', 'cancelled'), allowNull: false, defaultValue: 'active' },
  },
  { sequelize, tableName: 'campaigns', underscored: true }
);

// Many-to-many relation
Campaign.belongsToMany(Influencer, {
  through: CampaignInfluencer,
  as: 'collaborators',
  foreignKey: 'campaignId',
  otherKey: 'influencerId',
});

Influencer.belongsToMany(Campaign, {
  through: CampaignInfluencer,
  as: 'collaborations',
  foreignKey: 'influencerId',
  otherKey: 'campaignId',
});
