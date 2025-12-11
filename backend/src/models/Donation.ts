import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import { Donor } from './Donor';
import { Campaign } from './Campaign';

interface DonationAttributes {
  id: number;
  donorId: number;
  campaignId: number;
  amount: number;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DonationCreationAttributes extends Optional<DonationAttributes, 'id' | 'message'> {}

export class Donation extends Model<DonationAttributes, DonationCreationAttributes> implements DonationAttributes {
  public id!: number;
  public donorId!: number;
  public campaignId!: number;
  public amount!: number;
  public message!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Donation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    donorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'donor_id',
      references: {
        model: Donor,
        key: 'id',
      },
    },
    campaignId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'campaign_id',
      references: {
        model: Campaign,
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
  },
  {
    sequelize,
    tableName: 'donations',
    underscored: true,
  }
);

Donation.belongsTo(Donor, { foreignKey: 'donorId', as: 'donor' });
Donation.belongsTo(Campaign, { foreignKey: 'campaignId', as: 'campaign' });
Donor.hasMany(Donation, { foreignKey: 'donorId', as: 'donations' });
Campaign.hasMany(Donation, { foreignKey: 'campaignId', as: 'donations' });
