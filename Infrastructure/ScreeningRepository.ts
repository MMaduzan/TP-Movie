import type { Pool } from "pg";
import type { Screening } from "../Domain/Screening.js";

type ScreeningRow = {
  id: number;
  movieId: number;
  startTime: string;
  price: number;
  roomId: number;
  roomName: string;
  roomCapacity: number;
};

export class ScreeningRepository {
  public constructor(private readonly pool: Pool) {}

  public async listByMovieId(movieId: number): Promise<Screening[]> {
    const result = await this.pool.query<ScreeningRow>(
      `
      select
        s.id,
        s.movie_id as "movieId",
        s.start_time::text as "startTime",
        s.price::float8 as "price",
        r.id as "roomId",
        r.name as "roomName",
        r.capacity as "roomCapacity"
      from screenings s
      join rooms r on r.id = s.room_id
      where s.movie_id = $1
      order by s.start_time asc
      `,
      [movieId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      movieId: row.movieId,
      startTime: row.startTime,
      price: row.price,
      room: {
        id: row.roomId,
        name: row.roomName,
        capacity: row.roomCapacity,
      },
    }));
  }
}
