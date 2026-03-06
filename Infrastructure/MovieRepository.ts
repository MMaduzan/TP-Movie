import type { Pool } from "pg";
import type { Movie } from "../Domain/Movie.js";

type MovieRow = {
  id: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  rating: string | null;
  releaseDate: string | null;
};

export class MovieRepository {
  public constructor(private readonly pool: Pool) {}

  public async list(): Promise<Movie[]> {
    const result = await this.pool.query<MovieRow>(`
      select
        id,
        title,
        description,
        duration_minutes as "durationMinutes",
        rating,
        release_date::text as "releaseDate"
      from movies
      order by id asc
    `);

    return result.rows;
  }
}
