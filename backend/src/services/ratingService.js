require("dotenv").config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

exports.create = async (data) => {
  const { userId, movieId, rating } = data;
  
  return await prisma.rating.create({
    data: {
      userId,
      movieId,
      rating,
    },
  });
};

exports.list = async () => {
  return await prisma.rating.findMany({
    include: {
      user: true,
      movie: true,
    },
  });
};