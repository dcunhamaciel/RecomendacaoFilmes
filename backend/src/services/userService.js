const prisma = require("../database/prisma");

exports.create = async (data) => {
  return await prisma.user.create({ data });
};

exports.list = async () => {
  return await prisma.user.findMany();
};