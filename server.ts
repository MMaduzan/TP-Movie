import { createServer } from "node:http";
import { pool } from "./Infrastructure/DB.js";
import { MovieRepository } from "./Infrastructure/MovieRepository.js";
import { ScreeningRepository } from "./Infrastructure/ScreeningRepository.js";
import { router } from "./router.js";

const movies = new MovieRepository(pool);
const screenings = new ScreeningRepository(pool);

const server = createServer(async (req, res) => {
  await router(req, res, { pool, movies, screenings });
});

const port = Number(process.env.PORT ?? "3001");

server.listen(port, "0.0.0.0", () => {
  console.log(`Movie API listening on http://localhost:${port}`);
});
