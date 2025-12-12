import { initDatabase, sequelize } from './database';
import { Influencer, Campaign, Donor, Donation } from './models';

async function seed() {
  await initDatabase();

  // Clear existing data
  await Donation.destroy({ where: {} });
  await Campaign.destroy({ where: {} });
  await Donor.destroy({ where: {} });
  await Influencer.destroy({ where: {} });

  // Create Influencers
  const influencers = await Influencer.bulkCreate([
    {
      name: 'Alex Gaming',
      bio: 'Professional streamer and content creator focused on gaming tutorials and entertainment.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    },
    {
      name: 'Sarah Tech',
      bio: 'Tech reviewer and educator helping people navigate the digital world.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    },
    {
      name: 'Mike Fitness',
      bio: 'Fitness coach sharing workout routines and nutrition tips for a healthier lifestyle.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    },
  ]);

  // Create Campaigns
  const campaigns = await Campaign.bulkCreate([
    { title: 'New Gaming Setup', description: 'Help me upgrade my streaming setup!', goalAmount: 5000 },
    { title: 'Charity Gaming Marathon', description: '24-hour gaming marathon for charity', goalAmount: 10000 },
    { title: 'Tech Lab Equipment', description: 'Building a proper tech testing lab', goalAmount: 8000 },
    { title: 'Home Gym Build', description: 'Creating a professional home gym', goalAmount: 3000 },
  ]);

  // Attach collaborators (many-to-many)
  await campaigns[0].setCollaborators([influencers[0].id, influencers[1].id]);
  await campaigns[1].setCollaborators([influencers[0].id]);
  await campaigns[2].setCollaborators([influencers[1].id, influencers[2].id]);
  await campaigns[3].setCollaborators([influencers[2].id]);

  // Create Donors
  const donors = await Donor.bulkCreate([
    { name: 'John Smith', email: 'john@example.com' },
    { name: 'Emily Johnson', email: 'emily@example.com' },
    { name: 'David Wilson', email: 'david@example.com' },
    { name: 'Lisa Brown', email: 'lisa@example.com' },
    { name: 'Chris Lee', email: 'chris@example.com' },
  ]);

  // Create Donations
  const donationData = [
    { donorId: donors[0].id, campaignId: campaigns[0].id, amount: 50, message: 'Love your streams!' },
    { donorId: donors[1].id, campaignId: campaigns[0].id, amount: 100, message: 'Keep up the great work!' },
    { donorId: donors[2].id, campaignId: campaigns[1].id, amount: 200, message: 'Great cause!' },
    { donorId: donors[3].id, campaignId: campaigns[2].id, amount: 75, message: 'Your reviews are amazing!' },
    { donorId: donors[4].id, campaignId: campaigns[3].id, amount: 25, message: 'Thanks for the motivation!' },
    { donorId: donors[0].id, campaignId: campaigns[2].id, amount: 150, message: 'Excited for the new lab!' },
    { donorId: donors[1].id, campaignId: campaigns[3].id, amount: 50, message: 'Great tutorials!' },
  ];

  for (const data of donationData) {
    await Donation.create(data);
    await Campaign.increment('currentAmount', { by: data.amount, where: { id: data.campaignId } });
  }

  console.log('Seed data created successfully!');
  await sequelize.close();
}

seed();
