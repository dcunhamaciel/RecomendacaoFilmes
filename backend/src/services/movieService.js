const prisma = require("../database/prisma");

exports.create = async (data) => {
  return await prisma.movie.create({ data });
};

exports.list = async () => {
  const movies = await prisma.movie.findMany();

  const moviesWithStats = await Promise.all(
    movies.map(async (movie) => {
      const stats = await prisma.rating.aggregate({
        where: { movieId: movie.id },
        _avg: { rating: true },
        _count: { rating: true }
      });

      return {
        ...movie,
        averageRating: stats._avg.rating || 0,
        ratingsCount: stats._count.rating
      };
    })
  );

  return moviesWithStats;
};

exports.findById = async (id) => {
  return prisma.movie.findUnique({ where: { id: parseInt(id) } });
};