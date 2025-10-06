import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@batikpools.com' },
    update: {},
    create: {
      email: 'admin@batikpools.com',
      name: 'Admin Batik Pools',
      password: adminPassword,
      isAdmin: true,
      isActive: true,
      balance: 0,
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create test users
  const testUsers = [
    {
      email: 'user1@test.com',
      name: 'Test User 1',
      password: 'user123',
      balance: 1000000,
    },
    {
      email: 'user2@test.com',
      name: 'Test User 2',
      password: 'user123',
      balance: 2000000,
    },
    {
      email: 'user3@test.com',
      name: 'Test User 3',
      password: 'user123',
      balance: 500000,
    },
  ]

  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        isAdmin: false,
        isActive: true,
        balance: userData.balance,
      },
    })
    console.log('✅ Test user created:', user.email)
  }

  // Create system settings
  const settings = [
    {
      key: 'min_bet_amount',
      value: '10000',
      description: 'Minimum bet amount in IDR',
    },
    {
      key: 'max_bet_amount',
      value: '10000000',
      description: 'Maximum bet amount in IDR',
    },
    {
      key: 'draw_interval_minutes',
      value: '5',
      description: 'Interval between draws in minutes',
    },
    {
      key: 'system_status',
      value: 'active',
      description: 'System status: active, maintenance, closed',
    },
    {
      key: 'operating_hours_start',
      value: '08:00',
      description: 'Operating hours start time',
    },
    {
      key: 'operating_hours_end',
      value: '20:00',
      description: 'Operating hours end time',
    },
  ]

  for (const setting of settings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
    console.log('✅ System setting created:', setting.key)
  }

  // Create sample announcements
  const announcements = [
    {
      title: 'Selamat Datang di Batik Pools!',
      content: 'Nikmati pengalaman bermain lottery yang aman dan terpercaya dengan sistem kriptografi terkini.',
      type: 'info',
    },
    {
      title: 'Bonus Deposit 50%!',
      content: 'Dapatkan bonus deposit 50% untuk member baru. Minimal deposit Rp 50.000.',
      type: 'promotion',
    },
    {
      title: 'Pemeliharaan Sistem',
      content: 'Sistem akan melakukan pemeliharaan pada hari Minggu pukul 02:00 - 04:00 WIB.',
      type: 'maintenance',
    },
  ]

  for (const announcement of announcements) {
    await prisma.announcement.create({
      data: announcement,
    })
    console.log('✅ Announcement created:', announcement.title)
  }

  // Create sample lottery draws
  const sampleDraws = [
    {
      numbers: JSON.stringify([8, 2, 4, 9, 0, 1]),
      betType: '4D',
      seed: 'seed1',
      seedHash: 'hash1',
      signature: 'signature1',
      publicKey: 'publicKey1',
      isCompleted: true,
      drawTime: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    },
    {
      numbers: JSON.stringify([5, 7, 3, 1, 9, 2]),
      betType: '4D',
      seed: 'seed2',
      seedHash: 'hash2',
      signature: 'signature2',
      publicKey: 'publicKey2',
      isCompleted: true,
      drawTime: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
    },
    {
      numbers: JSON.stringify([1, 9, 8, 7, 6, 5]),
      betType: '4D',
      seed: 'seed3',
      seedHash: 'hash3',
      signature: 'signature3',
      publicKey: 'publicKey3',
      isCompleted: true,
      drawTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
  ]

  for (const draw of sampleDraws) {
    await prisma.lotteryDraw.create({
      data: draw,
    })
    console.log('✅ Sample draw created')
  }

  // Create sample bets
  const testUser1 = await prisma.user.findUnique({ where: { email: 'user1@test.com' } })
  const latestDraw = await prisma.lotteryDraw.findFirst({
    orderBy: { drawTime: 'desc' },
  })

  if (testUser1 && latestDraw) {
    const sampleBets = [
      {
        userId: testUser1.id,
        drawId: latestDraw.id,
        numbers: JSON.stringify([8, 2]),
        betType: '2D',
        amount: 50000,
        status: 'won',
      },
      {
        userId: testUser1.id,
        drawId: latestDraw.id,
        numbers: JSON.stringify([2, 4, 9]),
        betType: '3D',
        amount: 100000,
        status: 'lost',
      },
    ]

    for (const bet of sampleBets) {
      await prisma.bet.create({
        data: bet,
      })
      console.log('✅ Sample bet created')
    }
  }

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })