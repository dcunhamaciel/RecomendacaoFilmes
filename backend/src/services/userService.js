const prisma = require("../database/prisma");

exports.create = async (data) => {
  return await prisma.user.create({ data });
};

exports.list = async () => {
  return await prisma.user.findMany({
    include: {
      ratings: {
        include: {
          movie: true
        }
      }
    }
  });
};

exports.findById = async (id) => {
  return prisma.user.findUnique({ where: { id: parseInt(id) } });
};