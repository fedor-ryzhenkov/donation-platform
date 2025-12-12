import { sequelize } from './database';
import { Influencer, Campaign, Donor, Donation } from './models';
import { hashPassword } from './auth/password';

async function seed() {
  // For seeding, we want a schema reset so new/changed columns exist without using `alter`.
  await sequelize.sync({ force: true });
  console.log('Database synchronized');

  // Clear existing data
  await Donation.destroy({ where: {} });
  await Campaign.destroy({ where: {} });
  await Donor.destroy({ where: {} });
  await Influencer.destroy({ where: {} });

  // Create Influencers
  const influencerPasswords = {
    'Alex Gaming': 'alex123',
    'Sarah Tech': 'sarah123',
    'Mike Fitness': 'mike123',
  } as const;

  const influencers = await Influencer.bulkCreate([
    {
      name: 'Alex Gaming',
      bio: 'Professional streamer and content creator focused on gaming tutorials and entertainment.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      ...(() => {
        const { salt, hash } = hashPassword(influencerPasswords['Alex Gaming']);
        return { passwordSalt: salt, passwordHash: hash };
      })(),
    },
    {
      name: 'Sarah Tech',
      bio: 'Tech reviewer and educator helping people navigate the digital world.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      ...(() => {
        const { salt, hash } = hashPassword(influencerPasswords['Sarah Tech']);
        return { passwordSalt: salt, passwordHash: hash };
      })(),
    },
    {
      name: 'Mike Fitness',
      bio: 'Fitness coach sharing workout routines and nutrition tips for a healthier lifestyle.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      ...(() => {
        const { salt, hash } = hashPassword(influencerPasswords['Mike Fitness']);
        return { passwordSalt: salt, passwordHash: hash };
      })(),
    },
  ]);

  // Create Campaigns
  const campaigns = await Campaign.bulkCreate([
    {
      influencerId: influencers[0].id,
      title: 'New Gaming Setup',
      description: 'Help me upgrade my streaming setup to provide better quality content for you all!',
      goalAmount: 5000,
      currentAmount: 0,
      status: 'active',
    },
    {
      influencerId: influencers[0].id,
      title: 'Charity Gaming Marathon',
      description: '24-hour gaming marathon for charity. All proceeds go to local children hospital.',
      goalAmount: 10000,
      currentAmount: 0,
      status: 'active',
    },
    {
      influencerId: influencers[1].id,
      title: 'Tech Lab Equipment',
      description: 'Building a proper tech testing lab to bring you more in-depth reviews.',
      goalAmount: 8000,
      currentAmount: 0,
      status: 'active',
    },
    {
      influencerId: influencers[2].id,
      title: 'Home Gym Build',
      description: 'Creating a professional home gym to record better workout tutorials.',
      goalAmount: 3000,
      currentAmount: 0,
      status: 'active',
    },
  ]);

  // Create Donors
  const donorPasswords = {
    'john@example.com': 'john123',
    'emily@example.com': 'emily123',
    'david@example.com': 'david123',
    'lisa@example.com': 'lisa123',
    'chris@example.com': 'chris123',
  } as const;

  const donors = await Donor.bulkCreate([
    (() => {
      const email = 'john@example.com';
      const { salt, hash } = hashPassword(donorPasswords[email]);
      return { name: 'John Smith', email, passwordSalt: salt, passwordHash: hash };
    })(),
    (() => {
      const email = 'emily@example.com';
      const { salt, hash } = hashPassword(donorPasswords[email]);
      return { name: 'Emily Johnson', email, passwordSalt: salt, passwordHash: hash };
    })(),
    (() => {
      const email = 'david@example.com';
      const { salt, hash } = hashPassword(donorPasswords[email]);
      return { name: 'David Wilson', email, passwordSalt: salt, passwordHash: hash };
    })(),
    (() => {
      const email = 'lisa@example.com';
      const { salt, hash } = hashPassword(donorPasswords[email]);
      return { name: 'Lisa Brown', email, passwordSalt: salt, passwordHash: hash };
    })(),
    (() => {
      const email = 'chris@example.com';
      const { salt, hash } = hashPassword(donorPasswords[email]);
      return { name: 'Chris Lee', email, passwordSalt: salt, passwordHash: hash };
    })(),
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
    await Campaign.increment('currentAmount', {
      by: data.amount,
      where: { id: data.campaignId },
    });
  }

  console.log('Seed data created successfully!');
  console.log(`- ${influencers.length} influencers`);
  console.log(`- ${campaigns.length} campaigns`);
  console.log(`- ${donors.length} donors`);
  console.log(`- ${donationData.length} donations`);
  console.log('Seed passwords:');
  console.log('- Admin: set env ADMIN_PASSWORD (defaults to "admin")');
  console.log('- Influencers: Alex Gaming=alex123, Sarah Tech=sarah123, Mike Fitness=mike123');
  console.log('- Donors: john123, emily123, david123, lisa123, chris123 (match seeded emails)');

  await sequelize.close();
}

seed();
