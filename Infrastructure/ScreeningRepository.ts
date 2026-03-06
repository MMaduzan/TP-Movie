import { asc, eq } from "drizzle-orm";
import type { Pool } from "pg";
import type { Screening } from "../Domain/Screening.js";
import { createDb } from "./drizzle.js";
import { rooms, screenings } from "./schema.js";

export class ScreeningRepository {
  public constructor(private readonly pool: Pool) {}

  public async listByMovieId(movieId: number): Promise<Screening[]> {
    const db = createDb(this.pool);

    const items = await db
      .select({
        id: screenings.id,
        movieId: screenings.movieId,
        startTime: screenings.startTime,
        price: screenings.price,
        roomId: rooms.id,
        roomName: rooms.name,
        roomCapacity: rooms.capacity,
      })
      .from(screenings)
      .innerJoin(rooms, eq(rooms.id, screenings.roomId))
      .where(eq(screenings.movieId, movieId))
      .orderBy(asc(screenings.startTime));

    return items.map((row) => ({
      id: row.id,
      movieId: row.movieId,
      startTime: row.startTime,
      price: Number(row.price),
      room: {
        id: row.roomId,
        name: row.roomName,
        capacity: row.roomCapacity,
      },
    }));
  }
}
