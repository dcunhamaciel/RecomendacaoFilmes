require("dotenv").config();

const fs = require("fs");
const path = require("path");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("🌱 Seeding database...");
console.log(path.join(__dirname, "data/users.json"));
  const usersData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data/users.json"))
  );

  const moviesData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data/movies.json"))
  );

  await prisma.rating.deleteMany();
  await prisma.user.deleteMany();
  await prisma.movie.deleteMany();

  await prisma.user.createMany({ data: usersData });
  await prisma.movie.createMany({ data: moviesData });

  const users = await prisma.user.findMany();
  const movies = await prisma.movie.findMany();

  const ratings = [];

  for (const user of users) {
    const numberOfRatings = randomInt(8, 15);

    const shuffledMovies = [...movies].sort(() => 0.5 - Math.random());

    for (let i = 0; i < numberOfRatings; i++) {
      ratings.push({
        userId: user.id,
        movieId: shuffledMovies[i].id,
        rating: randomInt(1, 5),
      });
    }
  }

  await prisma.rating.createMany({ data: ratings });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });