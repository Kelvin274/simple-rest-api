const { z } = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Title must be a string',
    required_error: 'Title is required'
  }),
  year: z.number().int().min(1900).max(2025),
  director: z.string(),
  duration: z.number().int().positive(),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }),
  genre: z.array(
    z.enum([
      'Action',
      'Drama',
      'Crime',
      'Sci-Fi',
      'Thriller',
      'Comedy',
      'Romance',
      'Horror',
      'Animation',
      'Adventure',
      'Fantasy',
      'Mystery'
    ])
  ),
  rate: z.number().min(0).max(10).default(0)
})

function validateMovie(object) {
  return movieSchema.safeParse(object)
}

function validatePartialMovie(object) {
  return movieSchema.partial().safeParse(object)
}

module.exports = { validateMovie, validatePartialMovie }
