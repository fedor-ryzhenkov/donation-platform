import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export class CampaignInfluencer extends Model {
  public campaignId!: number;
  public influencerId!: number;
}

CampaignInfluencer.init(
  {
    campaignId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: 'campaign_id',
    },
    influencerId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: 'influencer_id',
    },
  },
  {
    sequelize,
    tableName: 'campaign_influencers',
    timestamps: false,
    underscored: true,
  }
);
