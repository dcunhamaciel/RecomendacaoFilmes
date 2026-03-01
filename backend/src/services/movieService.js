const prisma = require("../database/prisma");

exports.create = async (data) => {
  return await prisma.movie.create({ data });
};

exports.list = async () => {
  return await prisma.movie.findMany();
};

exports.findById = async (id) => {
  return prisma.movie.findUnique({ where: { id: parseInt(id) } });
};