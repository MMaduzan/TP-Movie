import type { IncomingMessage, ServerResponse } from "node:http";
import type { Pool } from "pg";
import { z } from "zod";
import { isEveningScreening } from "./Domain/ScreeningService.js";
import type { MovieRepository } from "./Infrastructure/MovieRepository.js";
import type { ScreeningRepository } from "./Infrastructure/ScreeningRepository.js";

type RouterDeps = {
  pool: Pool;
  movies: MovieRepository;
  screenings: ScreeningRepository;
};

const MovieIdSchema = z.coerce.number().int().positive();

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendError(res: ServerResponse, status: number, message: string): void {
  sendJson(res, status, { ok: false, error: message });
}

export async function router(
  req: IncomingMessage,
  res: ServerResponse,
  deps: RouterDeps
): Promise<void> {
  const { movies, screenings } = deps;
  const method = req.method ?? "GET";
  const [path] = (req.url ?? "/").split("?", 2);
  const segments = (path ?? "/").split("/").filter(Boolean);

  try {
    if (method === "GET" && path === "/health") {
      return sendJson(res, 200, { ok: true });
    }

    if (method === "GET" && path === "/movies") {
      const items = await movies.list();
      return sendJson(res, 200, { ok: true, items });
    }

    const isMovieScreeningsRoute =
      method === "GET" &&
      segments[0] === "movies" &&
      (segments[2] === "screenings" || segments[2] === "seances") &&
      segments.length === 3;

    if (isMovieScreeningsRoute) {
      const parsedMovieId = MovieIdSchema.safeParse(segments[1]);
      if (!parsedMovieId.success) {
        return sendError(res, 400, "Invalid movie id");
      }

      const movieId = parsedMovieId.data;
      const items = await screenings.listByMovieId(movieId);
      const enrichedItems = items.map((item) => ({
        ...item,
        isEvening: isEveningScreening(item),
      }));

      return sendJson(res, 200, { ok: true, items: enrichedItems });
    }

    return sendError(res, 404, "Not Found");
  } catch (_error) {
    return sendError(res, 500, "Internal Server Error");
  }
}
