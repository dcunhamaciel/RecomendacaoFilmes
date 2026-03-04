const prisma = require("../database/prisma");

exports.create = async (data) => {
  const { userId, movieId, rating } = data;
    
  return await prisma.rating.upsert({
    where: {
      userId_movieId: {
        userId,
        movieId
      }
    },
    update: {
      rating
    },
    create: {
      userId,
      movieId,
      rating
    }
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