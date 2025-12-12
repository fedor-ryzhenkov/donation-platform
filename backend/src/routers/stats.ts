import { Router, Request, Response } from 'express';
import { Influencer, Campaign, Donor, Donation } from '../models';
import { sequelize } from '../database';
import { requireRole } from '../auth/middleware';

const router = Router();

// GET /api/stats - Platform statistics for admin
router.get('/', requireRole('admin'), async (_req: Request, res: Response) => {
  const [
    totalInfluencers,
    totalCampaigns,
    totalDonors,
    totalDonations,
    donationStats,
    activeCampaigns,
    completedCampaigns,
    recentDonations,
    topCampaigns,
  ] = await Promise.all([
    Influencer.count(),
    Campaign.count(),
    Donor.count(),
    Donation.count(),
    Donation.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('AVG', sequelize.col('amount')), 'averageAmount'],
      ],
      raw: true,
    }),
    Campaign.count({ where: { status: 'active' } }),
    Campaign.count({ where: { status: 'completed' } }),
    Donation.findAll({
      include: [
        { model: Donor, as: 'donor' },
        { model: Campaign, as: 'campaign' },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    }),
    Campaign.findAll({
      include: [{ model: Influencer, as: 'influencer' }],
      order: [['currentAmount', 'DESC']],
      limit: 5,
    }),
  ]);

  const stats = donationStats as unknown as { totalAmount: number | null; averageAmount: number | null };

  res.json({
    overview: {
      totalInfluencers,
      totalCampaigns,
      totalDonors,
      totalDonations,
      totalDonationAmount: stats?.totalAmount || 0,
      averageDonationAmount: stats?.averageAmount || 0,
    },
    campaigns: {
      active: activeCampaigns,
      completed: completedCampaigns,
      cancelled: totalCampaigns - activeCampaigns - completedCampaigns,
    },
    recentDonations,
    topCampaigns,
  });
});

export default router;
