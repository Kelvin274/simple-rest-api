import mysql from 'mysql2/promise'

const config = {
  host: 'localhost',
  port: 3310,
  user: 'root',
  password: '123456',
  database: 'moviesdb'
}

const connection = await mysql.createConnection(config)

export class MovieModel {
  static getAll = async ({ genre }) => {
    if (genre) {
      const lowerCaseGenre = genre.toLowerCase()
      const [genres] = await connection.query(
        'SELECT id, name FROM genre WHERE LOWER(name) = ?;',
        [lowerCaseGenre]
      )

      if (genres.length === 0) return []

      // [ {id: 1, name: 'Action'}]
      const [{ id }] = genres

      // get all movies ids from database table
      // query to movie_genres
      // join the results
      const [moviesByGender] = await connection.query(
        `SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie
        JOIN movie_genres mg ON movie.id = mg.movie_id
        WHERE mg.genre_id = ?;`,
        [id]
      )

      // and print the result
      return moviesByGender
    }

    const [movies] = await connection.query(
      'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie; '
    )

    return movies
  }

  static async getById({ id }) {
    const [movie] = await connection.query(
      'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie WHERE id = UUID_TO_BIN(?);',
      [id]
    )

    return movie
  }

  static async create({ dataMovie }) {
    const {
      genre: genreInputs,
      title,
      year,
      director,
      duration,
      poster,
      rate
    } = dataMovie

    // no pasarle la id directamente, SQL INYECTION.
    const [uuidResult] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuidResult

    try {
      // insert into movie_genres
      const placeholders = await genreInputs
        .map(
          () =>
            `(UUID_TO_BIN("${uuid}"), (SELECT id FROM genre WHERE LOWER(name) = LOWER(?)))`
        )
        .join(', ')

      const query = `
        INSERT INTO movie_genres (movie_id, genre_id)
        VALUES ${placeholders};
        `
      await connection.query(query, genreInputs)

      // insert into movie
      await connection.query(
        `INSERT INTO movie (id, title, year, director, duration, poster, rate)
            VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?);`,
        [title, year, director, duration, poster, rate]
      )
    } catch (error) {
      // puede enviarle informacion sensible
      throw new Error('Error creating movie')
    }

    const [movies] = await connection.query(
      `SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate
        FROM movie
        WHERE id = UUID_TO_BIN(?);
        `,
      [uuid]
    )

    return movies[0]
  }

  static async update({ id, dataMovie }) {
    const keysToUpdate = Object.keys(dataMovie)
    const valuesToUpdate = Object.values(dataMovie)

    const placeholder = keysToUpdate.map((elm) => `${elm} = (?)`).join(', ')
    const query = `UPDATE movie
                  SET ${placeholder}
                  WHERE id = UUID_TO_BIN(?);
                  `

    try {
      // actualizar la base de datos
      console.log(query, [...valuesToUpdate, id])
      await connection.query(query, [...valuesToUpdate, id])
    } catch (error) {
      throw new Error('Error updating movie')
    }

    const [movies] = await connection.query(
      `SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate
        FROM movie
        WHERE id = UUID_TO_BIN(?);
        `,
      [id]
    )

    return movies[0]
  }

  static async delete({ id }) {
    await connection.beginTransaction()

    try {
      await connection.query('DELETE FROM movie WHERE id = UUID_TO_BIN(?)', [
        id
      ])

      await connection.query(
        'DELETE FROM movie_genres WHERE movie_id = UUID_TO_BIN(?)',
        [id]
      )

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw new Error('Error deleting movie')
    }
  }
}
