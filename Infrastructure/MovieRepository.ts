import { asc } from "drizzle-orm";
import type { Pool } from "pg";
import type { Movie } from "../Domain/Movie.js";
import { createDb } from "./drizzle.js";
import { movies } from "./schema.js";

export class MovieRepository {
  public constructor(private readonly pool: Pool) {}

  public async list(): Promise<Movie[]> {
    const db = createDb(this.pool);

    return db
      .select({
        id: movies.id,
        title: movies.title,
        description: movies.description,
        durationMinutes: movies.durationMinutes,
        rating: movies.rating,
        releaseDate: movies.releaseDate,
      })
      .from(movies)
      .orderBy(asc(movies.id));
  }
}
