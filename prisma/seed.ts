import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaPg({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const prisma = new PrismaClient({ adapter });

const CATEGORIES = ["General", "Food", "Hygiene", "Medicines", "Beverages"];

const BUSINESSES = [
  {
    name: "La Familia Grocery",
    type: "grocery_store",
    address: "Sol Street #152, Centro Habana, Havana",
    phone: "76010001",
    scheduleDays: "Mon, Tue, Wed, Thu, Fri, Sat",
    scheduleHours: "08:00 AM - 06:00 PM",
    latitude: 23.1367,
    longitude: -82.3585,
    isDelivery: true,
    products: [
      { name: "Rice", price: 30, unit: "kg", category: "Food", imageUrl: "https://picsum.photos/seed/rice/100" },
      { name: "Black beans", price: 25, unit: "kg", category: "Food", imageUrl: "https://picsum.photos/seed/beans/100" },
      { name: "Oil", price: 45, unit: "bottle", category: "Food", imageUrl: "https://picsum.photos/seed/oil/100" },
      { name: "Sugar", price: 20, unit: "lb", category: "Food", imageUrl: "https://picsum.photos/seed/sugar/100" },
      { name: "Soap", price: 15, unit: "unit", category: "Hygiene", imageUrl: "https://picsum.photos/seed/soap/100" },
    ],
  },
  {
    name: "International Pharmacy",
    type: "pharmacy",
    address: "Malecon at 23rd St, Vedado, Havana",
    phone: "78339111",
    scheduleDays: "Todos los días",
    scheduleHours: "12:00 AM - 11:59 PM",
    latitude: 23.1423,
    longitude: -82.3685,
    isDelivery: false,
    products: [
      { name: "Aspirin", price: 12, unit: "box", category: "Medicines", imageUrl: "https://picsum.photos/seed/aspirin/100" },
      { name: "Vitamin C", price: 28, unit: "jar", category: "Medicines", imageUrl: "https://picsum.photos/seed/vitaminc/100" },
      { name: "Ibuprofen", price: 18, unit: "box", category: "Medicines", imageUrl: "https://picsum.photos/seed/ibuprofen/100" },
      { name: "Bandages", price: 9, unit: "pack", category: "Medicines", imageUrl: "https://picsum.photos/seed/bandages/100" },
    ],
  },
  {
    name: "El Paladar Restaurant",
    type: "restaurant",
    address: "10th St #57, Miramar, Havana",
    phone: "72041234",
    scheduleDays: "Tue, Wed, Thu, Fri, Sat, Sun",
    scheduleHours: "12:00 PM - 11:00 PM",
    latitude: 23.1206,
    longitude: -82.4182,
    isDelivery: true,
    products: [
      { name: "Shredded beef", price: 180, unit: "plate", category: "Food", imageUrl: "https://picsum.photos/seed/ropa/100" },
      { name: "Mojito", price: 50, unit: "glass", category: "Beverages", imageUrl: "https://picsum.photos/seed/mojito/100" },
      { name: "Ropa Vieja", price: 160, unit: "plate", category: "Food", imageUrl: "https://picsum.photos/seed/ropavieja/100" },
      { name: "Cuban Sandwich", price: 90, unit: "unit", category: "Food", imageUrl: "https://picsum.photos/seed/sandwich/100" },
      { name: "Cristal Beer", price: 40, unit: "bottle", category: "Beverages", imageUrl: "https://picsum.photos/seed/beer/100" },
    ],
  },
];

async function main() {
  await prisma.product.deleteMany();
  await prisma.business.deleteMany();
  await prisma.category.deleteMany();

  for (const category of CATEGORIES) {
    await prisma.category.create({ data: { name: category } });
  }

  for (const business of BUSINESSES) {
    const { products, ...businessData } = business;
    await prisma.business.create({
      data: {
        ...businessData,
        products: { create: products },
      },
    });
  }

  console.log(
    `Seed completed: ${BUSINESSES.length} businesses with products created.`,
  );
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
