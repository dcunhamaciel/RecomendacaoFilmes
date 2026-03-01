const prisma = require("../database/prisma");

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