import "dotenv/config"

import {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  PlantStage,
  PrismaClient,
  Role,
} from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { hashPassword } from "../lib/auth/password"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

const now = new Date()

const products = [
  {
    name: "DK Essential Tee - Forest",
    slug: "dk-essential-tee-forest",
    description:
      "A breathable bamboo-spandex performance tee in deep forest green. Packed in a reusable aluminum tin with basil seeds for your first desk garden.",
    price: 2499,
    stock: 18,
    activity: "daily",
    seedType: "Basil",
    images: ["/products/tee.svg", "/products/tin.svg"],
  },
  {
    name: "DK Performance Tee - Stone",
    slug: "dk-performance-tee-stone",
    description:
      "Lightweight stone-grey active tee built for workouts and long commutes. Includes mint seeds and a compact growth kit inside the tin.",
    price: 2799,
    stock: 14,
    activity: "gym",
    seedType: "Mint",
    images: ["/products/tee.svg", "/products/tin.svg"],
  },
  {
    name: "DK Boardroom Polo - Slate",
    slug: "dk-boardroom-polo-slate",
    description:
      "Smart-casual polo with stretch, odor resistance, and a sharp drape for hybrid work days. Ships with lavender seeds for a calmer workspace.",
    price: 3199,
    stock: 10,
    activity: "work",
    seedType: "Lavender",
    images: ["/products/tee.svg", "/products/tin.svg"],
  },
  {
    name: "DK Trail Tee - Earth",
    slug: "dk-trail-tee-earth",
    description:
      "Outdoor-ready tee designed for sun, sweat, and movement. The aluminum tin includes hardy succulent seeds for low-maintenance growth.",
    price: 2899,
    stock: 12,
    activity: "outdoor",
    seedType: "Succulent",
    images: ["/products/tee.svg", "/products/tin.svg"],
  },
  {
    name: "DK Flow Tee - Mist",
    slug: "dk-flow-tee-mist",
    description:
      "Soft-touch studio tee for yoga, mobility, and slow mornings. Packed with chamomile seeds for a gentle wellness ritual after unboxing.",
    price: 2699,
    stock: 16,
    activity: "yoga",
    seedType: "Chamomile",
    images: ["/products/tee.svg", "/products/tin.svg"],
  },
  {
    name: "DK Everyday Jogger - Cinder",
    slug: "dk-everyday-jogger-cinder",
    description:
      "A tapered bamboo-blend jogger for travel days and recovery sessions. Includes aloe seeds and a durable reusable tin planter.",
    price: 3499,
    stock: 9,
    activity: "daily",
    seedType: "Aloe",
    images: ["/products/jogger.svg", "/products/tin.svg"],
  },
  {
    name: "DK Training Hoodie - Midnight",
    slug: "dk-training-hoodie-midnight",
    description:
      "Structured lightweight hoodie for early workouts and evening layering. Comes with rosemary seeds to keep the ritual feeling premium.",
    price: 4299,
    stock: 7,
    activity: "gym",
    seedType: "Rosemary",
    images: ["/products/hoodie.svg", "/products/tin.svg"],
  },
  {
    name: "DK Limited Tin Set - Sand",
    slug: "dk-limited-tin-set-sand",
    description:
      "A collector-style premium tee and tin combo with an elevated brushed-metal finish. Bundled with marigold seeds for a bright windowsill display.",
    price: 3899,
    stock: 6,
    activity: "work",
    seedType: "Marigold",
    images: ["/products/tin.svg", "/products/tee.svg"],
  },
]

const userSeeds = [
  { name: "Demo Grower", email: "demo@alumandearth.com", role: Role.USER },
  { name: "Aarav Khanna", email: "aarav@alumandearth.com", role: Role.USER },
  { name: "Meera Shah", email: "meera@alumandearth.com", role: Role.USER },
  { name: "Rohit Patel", email: "rohit@alumandearth.com", role: Role.USER },
  { name: "Nisha Tandon", email: "nisha@alumandearth.com", role: Role.USER },
  { name: "Kabir Rao", email: "kabir@alumandearth.com", role: Role.USER },
  { name: "Ishita Sen", email: "ishita@alumandearth.com", role: Role.USER },
  { name: "Dev Malhotra", email: "dev@alumandearth.com", role: Role.USER },
  { name: "Ananya Iyer", email: "ananya@alumandearth.com", role: Role.USER },
  { name: "Admin", email: "admin@alumandearth.com", role: Role.ADMIN },
]

type SeedUser = {
  id: string
  name: string | null
  email: string
  role: Role
}

function daysAgo(days: number) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

async function resetDatabase() {
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.growthLog.deleteMany()
  await prisma.reminder.deleteMany()
  await prisma.plant.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.leaderboard.deleteMany()
  await prisma.ecoImpact.deleteMany()
  await prisma.user.deleteMany()
}

async function seedUsers() {
  const password = await hashPassword("Demo@12345")

  const created = await Promise.all(
    userSeeds.map((user, index) =>
      prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password,
          role: user.role,
          createdAt: daysAgo(45 - index),
        },
      })
    )
  )

  return created
}

async function seedProducts() {
  return Promise.all(
    products.map((product, index) =>
      prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          stock: product.stock,
          activity: product.activity,
          seedType: product.seedType,
          createdAt: daysAgo(30 - index),
          images: {
            create: product.images.map((url, order) => ({ url, order })),
          },
        },
        include: {
          images: { orderBy: { order: "asc" } },
        },
      })
    )
  )
}

async function seedCart(demoUserId: string, seededProducts: Awaited<ReturnType<typeof seedProducts>>) {
  await prisma.cart.create({
    data: {
      userId: demoUserId,
      items: {
        create: [
          { productId: seededProducts[0].id, quantity: 1 },
          { productId: seededProducts[5].id, quantity: 1 },
          { productId: seededProducts[6].id, quantity: 2 },
        ],
      },
    },
  })
}

async function seedOrders(demoUserId: string, seededProducts: Awaited<ReturnType<typeof seedProducts>>) {
  const ordersData = [
    {
      status: OrderStatus.DELIVERED,
      createdAt: daysAgo(18),
      items: [
        { productId: seededProducts[0].id, quantity: 1, price: seededProducts[0].price },
        { productId: seededProducts[3].id, quantity: 1, price: seededProducts[3].price },
      ],
      payment: { provider: PaymentProvider.RAZORPAY, status: PaymentStatus.SUCCESS },
    },
    {
      status: OrderStatus.SHIPPED,
      createdAt: daysAgo(9),
      items: [
        { productId: seededProducts[5].id, quantity: 1, price: seededProducts[5].price },
      ],
      payment: { provider: PaymentProvider.STRIPE, status: PaymentStatus.SUCCESS },
    },
    {
      status: OrderStatus.PAID,
      createdAt: daysAgo(4),
      items: [
        { productId: seededProducts[6].id, quantity: 1, price: seededProducts[6].price },
        { productId: seededProducts[1].id, quantity: 2, price: seededProducts[1].price },
      ],
      payment: { provider: PaymentProvider.RAZORPAY, status: PaymentStatus.SUCCESS },
    },
    {
      status: OrderStatus.CANCELLED,
      createdAt: daysAgo(2),
      items: [
        { productId: seededProducts[7].id, quantity: 1, price: seededProducts[7].price },
      ],
      payment: { provider: PaymentProvider.STRIPE, status: PaymentStatus.FAILED },
    },
  ]

  for (const orderData of ordersData) {
    const totalAmount = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    await prisma.order.create({
      data: {
        userId: demoUserId,
        status: orderData.status,
        totalAmount,
        shippingName: "Demo Grower",
        shippingPhone: "9876543210",
        shippingAddr: "42 Green Corridor",
        shippingCity: "Bengaluru",
        shippingState: "Karnataka",
        shippingZip: "560001",
        shippingCountry: "India",
        createdAt: orderData.createdAt,
        items: {
          create: orderData.items,
        },
        payment: {
          create: {
            provider: orderData.payment.provider,
            amount: totalAmount,
            status: orderData.payment.status,
            providerRef: `${orderData.payment.provider.toLowerCase()}_${Math.random().toString(36).slice(2, 10)}`,
            createdAt: orderData.createdAt,
          },
        },
      },
    })
  }
}

async function seedPlants(users: SeedUser[], seededProducts: Awaited<ReturnType<typeof seedProducts>>) {
  const demoUser = users.find((user) => user.email === "demo@alumandearth.com")
  if (!demoUser) {
    throw new Error("Demo user missing during plant seeding")
  }

  const plantRows = [
    {
      userId: demoUser.id,
      productId: seededProducts[0].id,
      seedType: "Basil",
      qrCode: "DK-DEMO-BASIL-001",
      stage: PlantStage.MATURE,
      createdAt: daysAgo(28),
      logs: [
        { note: "Scanned the QR and planted the basil kit today.", createdAt: daysAgo(27) },
        { note: "First tiny sprout visible near the rim of the tin.", createdAt: daysAgo(22) },
        { note: "Moved it closer to the window. Growth is steady now.", createdAt: daysAgo(16) },
      ],
      reminderDaysFromNow: 1,
    },
    {
      userId: demoUser.id,
      productId: seededProducts[1].id,
      seedType: "Mint",
      qrCode: "DK-DEMO-MINT-002",
      stage: PlantStage.GROWING,
      createdAt: daysAgo(17),
      logs: [
        { note: "Mint seeds planted after my gym session.", createdAt: daysAgo(16) },
        { note: "Leaves are opening up and smell great already.", createdAt: daysAgo(8) },
      ],
      reminderDaysFromNow: 2,
    },
    {
      userId: demoUser.id,
      productId: seededProducts[2].id,
      seedType: "Lavender",
      qrCode: "DK-DEMO-LAV-003",
      stage: PlantStage.SPROUT,
      createdAt: daysAgo(8),
      logs: [
        { note: "Tiny lavender shoot appeared this morning.", createdAt: daysAgo(3) },
      ],
      reminderDaysFromNow: 3,
    },
    {
      userId: demoUser.id,
      productId: seededProducts[4].id,
      seedType: "Chamomile",
      qrCode: "DK-DEMO-CHAM-004",
      stage: PlantStage.SEEDED,
      createdAt: daysAgo(2),
      logs: [],
      reminderDaysFromNow: 1,
    },
  ]

  for (const row of plantRows) {
    const plant = await prisma.plant.create({
      data: {
        userId: row.userId,
        productId: row.productId,
        seedType: row.seedType,
        qrCode: row.qrCode,
        stage: row.stage,
        createdAt: row.createdAt,
      },
    })

    if (row.logs.length > 0) {
      await prisma.growthLog.createMany({
        data: row.logs.map((log) => ({
          plantId: plant.id,
          userId: row.userId,
          note: log.note,
          createdAt: log.createdAt,
        })),
      })
    }

    await prisma.reminder.create({
      data: {
        userId: row.userId,
        plantId: plant.id,
        time: new Date(now.getTime() + row.reminderDaysFromNow * 24 * 60 * 60 * 1000),
        createdAt: daysAgo(1),
      },
    })
  }

  const leaderboardUsers = users.filter((user) => user.email !== "admin@alumandearth.com")

  for (const [index, user] of leaderboardUsers.entries()) {
    const points = [1260, 1125, 980, 860, 740, 620, 500, 380, 265][index] ?? 150

    await prisma.leaderboard.create({
      data: {
        userId: user.id,
        points,
        rank: index + 1,
      },
    })
  }

  const otherUsers = leaderboardUsers.filter((user) => user.id !== demoUser.id)
  for (const [index, user] of otherUsers.entries()) {
    await prisma.plant.create({
      data: {
        userId: user.id,
        productId: seededProducts[index % seededProducts.length].id,
        seedType: seededProducts[index % seededProducts.length].seedType,
        qrCode: `DK-COMMUNITY-${String(index + 1).padStart(3, "0")}`,
        stage: [PlantStage.SPROUT, PlantStage.GROWING, PlantStage.MATURE][index % 3],
        createdAt: daysAgo(12 + index),
      },
    })
  }
}

async function seedEcoImpact() {
  await prisma.ecoImpact.create({
    data: {
      totalTins: 2847,
      totalPlants: 2391,
      totalCO2Saved: 50211,
    },
  })
}

async function main() {
  await resetDatabase()

  const users = await seedUsers()
  const seededProducts = await seedProducts()

  const demoUser = users.find((user) => user.email === "demo@alumandearth.com")
  if (!demoUser) {
    throw new Error("Demo user missing after user seed")
  }

  await seedCart(demoUser.id, seededProducts)
  await seedOrders(demoUser.id, seededProducts)
  await seedPlants(users, seededProducts)
  await seedEcoImpact()

  console.log("Database seeded successfully.")
  console.log("Demo login: demo@alumandearth.com / Demo@12345")
  console.log("Admin login: admin@alumandearth.com / Demo@12345")
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
