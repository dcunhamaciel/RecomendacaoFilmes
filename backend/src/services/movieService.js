require("dotenv").config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

exports.create = async (data) => {
  return await prisma.movie.create({ data });
};

exports.list = async () => {
  return await prisma.movie.findMany();
};