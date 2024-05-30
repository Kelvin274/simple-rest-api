const crypto = require('node:crypto')
const express = require('express')
const cors = require('cors')
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies.js')

const app = express()
const PORT = process.env.PORT ?? 3000
app.use(express.json())
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5000',
        'http://localhost:8080'
      ]

      if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        return callback(null, true)
      }
      return callback(new Error('No permitido por CORS'))
    }
  })
)
app.disable('x-powered-by')

// Todos los recursos que se identifican con este recurso. Ademas del filtro
app.get('/movies', (req, res) => {
  // No necesario debido a la dependencia CORS.
  // const origin = req.header('origin')

  // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
  //   res.header('Access-Control-Allow-Origin', origin)
  // }
  const { genre } = req.query

  if (genre) {
    const filterMoviesByGenre = movies.find((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filterMoviesByGenre)
  }

  res.json(movies)
})

// Id pelicula Batman: c8a7d63f-3b04-44d3-9d95-8782fd7dcfaf
app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find((movie) => movie.id === id)

  if (movie) return res.json(movie)

  res.status(404).json({ error: 'Movie not found' })
})

// Cambiar datos de la pelicula
app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (result.error) {
    return res.status(400).json({
      error: JSON.parse(result.error.message)
    })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ error: 'Movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  return res.json(updateMovie)
})

app.post('/movies', (req, res) => {
  // El recurso se identifica con la misma url.
  const result = validateMovie(req.body)

  if (result.error) {
    res.status(422).json({
      error: JSON.parse(result.error.message)
    })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }

  // Esto no seria REST, por que estamos guardando el estado de la aplicacion en memoria
  movies.push(newMovie)

  res.status(201).json(newMovie) // actualizar la cache del cliente
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ error: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

// Sin utilizar la dependencia CORS.
// app.options('/movies/:id', (req, res) => {
//   const origin = req.header('origin')

//   if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
//     res.header('Access-Control-Allow-Origin', origin)
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
//   }

//   res.send()
// })

app.listen(PORT, () => {
  console.log(`server running on port http://localhost:${PORT}`)
})

// *******************
// Todas las movies
// GET http://localhost:3000/movies

// Recuperar pelicula por ID
// GET http://localhost:3000/movies/1

// Recuperar movies por genero
// GET http://localhost:3000/movies?genre=terror

// Crear una pelicula
// POST http://localhost:3000/movies
/*
{
  id: '',
  title: 'The Godfather
  "year": 1972,
  "director": "Francis Ford Coppola",
  "running_time": 175,
  "poster": "https://i.ebayimg.com/images/g/4goAAOSwMyBe7hnQ/s-l1200.webp",
  "genres": ["Drama", "Crime"],
  "rate": 9.3
}
 */

// Actualizar una pelicula
// PATCH http://localhost:3000/movies/15cfde3d-b83e-4477-aff8-b492bc0a64eb
