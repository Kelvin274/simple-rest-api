import { MovieModel } from '../models/movie.js'

import { validateMovie, validatePartialMovie } from '../schemas/movies.js'

export class MovieController {
  static async getAll(req, res) {
    const { genre } = req.query
    const movies = await MovieModel.getAll({ genre })

    // Cambiamos a logica de negocio con class
    // if (genre) {
    //   const filterMoviesByGenre = movies.find((movie) =>
    //     movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    //   )
    //   return res.json(filterMoviesByGenre)
    // }

    // que es lo que renderiza?
    res.json(movies)
  }

  static async getById(req, res) {
    const { id } = req.params
    const movie = await MovieModel.getById({ id })

    // Cambiamos a logica de negocio x class
    // const movie = movies.find((movie) => movie.id === id)

    if (movie) return res.json(movie)

    res.status(404).json({ error: 'Movie not found' })
  }

  static async create(req, res) {
    // El recurso se identifica con la misma url.
    const result = validateMovie(req.body)

    if (result.error) {
      res.status(422).json({
        error: JSON.parse(result.error.message)
      })
    }

    const newMovie = await MovieModel.create({ dataMovie: result.data })

    // Cambiamos a logica de negocio x class
    // const newMovie = {
    //   id: randomUUID(),
    //   ...result.data
    // }

    // // Esto no seria REST, por que estamos guardando el estado de la aplicacion en memoria
    // movies.push(newMovie)

    res.status(201).json(newMovie) // actualizar la cache del cliente
  }

  static async update(req, res) {
    const result = validatePartialMovie(req.body)

    if (result.error) {
      return res.status(400).json({
        error: JSON.parse(result.error.message)
      })
    }

    const { id } = req.params
    const updateMovie = await MovieModel.update({
      id,
      dataMovie: result.data
    })

    // Cambiamos a logica de negocio x class
    // const movieIndex = movies.findIndex((movie) => movie.id === id)

    if (updateMovie === false) {
      return res.status(404).json({ error: 'Movie not found' })
    }

    // const updateMovie = {
    //   ...movies[movieIndex],
    //   ...result.data
    // }

    return res.json(updateMovie)
  }

  static async delete(req, res) {
    const { id } = req.params

    const result = await MovieModel.delete({ id })
    // Cambiamos a logica de middleware x class
    // const movieIndex = movies.findIndex((movie) => movie.id === id)

    if (result === false) {
      return res.status(404).json({ error: 'Movie not found' })
    }

    // movies.splice(movieIndex, 1)

    return res.json({ message: 'Movie deleted' })
  }
}
