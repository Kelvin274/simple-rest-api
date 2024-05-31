import { randomUUID } from 'node:crypto'
import { readJSON } from '../utils.js'

const movies = readJSON('./movies.json')

export class MovieModel {
  static getAll = async ({ genre }) => {
    if (genre) {
      return movies.filter((movie) =>
        movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
      )
    }
    return movies
  }

  static async getById({ id }) {
    const movie = movies.find((movie) => movie.id === id)
    return movie
  }

  static async create({ dataMovie }) {
    const newMovie = {
      id: randomUUID(),
      ...dataMovie
    }
    movies.push(newMovie)
    return newMovie
  }

  static async update({ id, dataMovie }) {
    const movieIndex = movies.findIndex((movie) => movie.id === id)

    if (movieIndex === -1) return false

    const updateMovie = {
      ...movies[movieIndex],
      ...dataMovie
    }

    return updateMovie
  }

  static async delete({ id }) {
    const movieIndex = movies.findIndex((movie) => movie.id === id)

    if (movieIndex === -1) return false

    movies.splice(movieIndex, 1)

    return true
  }
}
