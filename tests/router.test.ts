import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import type { Pool } from "pg";
import type { Movie } from "../Domain/Movie.js";
import type { Screening } from "../Domain/Screening.js";
import { MovieRepository } from "../Infrastructure/MovieRepository.js";
import { ScreeningRepository } from "../Infrastructure/ScreeningRepository.js";
import { router } from "../router.js";

type RouterDeps = Parameters<typeof router>[2];

type MockOptions = {
  moviesItems?: Movie[];
  screeningsItems?: Screening[];
  moviesError?: Error;
  screeningsError?: Error;
};

async function startServer(deps: RouterDeps): Promise<{
  baseUrl: string;
  close: () => Promise<void>;
}> {
  const server = createServer(async (req, res) => {
    await router(req, res, deps);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to start test server");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };
}

async function getJson(baseUrl: string, path: string): Promise<{
  status: number;
  body: unknown;
}> {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.json();
  return { status: response.status, body };
}

function createDeps(options: MockOptions = {}): {
  deps: RouterDeps;
  getLastMovieId: () => number | null;
} {
  let lastMovieId: number | null = null;

  const movies = new MovieRepository({} as Pool);
  movies.list = async () => {
    if (options.moviesError) {
      throw options.moviesError;
    }
    return options.moviesItems ?? [];
  };

  const screenings = new ScreeningRepository({} as Pool);
  screenings.listByMovieId = async (movieId: number) => {
    lastMovieId = movieId;
    if (options.screeningsError) {
      throw options.screeningsError;
    }
    return options.screeningsItems ?? [];
  };

  return {
    deps: {
      pool: {} as Pool,
      movies,
      screenings,
    },
    getLastMovieId: () => lastMovieId,
  };
}

test("GET /health returns ok", async () => {
  const { deps } = createDeps();
  const { baseUrl, close } = await startServer(deps);

  try {
    const response = await getJson(baseUrl, "/health");
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { ok: true });
  } finally {
    await close();
  }
});

test("GET /movies returns movie list", async () => {
  const { deps } = createDeps({
    moviesItems: [
      {
        id: 1,
        title: "Inception",
        description: "Sci-fi thriller",
        durationMinutes: 148,
        rating: "PG-13",
        releaseDate: "2010-07-16",
      },
    ],
  });
  const { baseUrl, close } = await startServer(deps);

  try {
    const response = await getJson(baseUrl, "/movies");
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      ok: true,
      items: [
        {
          id: 1,
          title: "Inception",
          description: "Sci-fi thriller",
          durationMinutes: 148,
          rating: "PG-13",
          releaseDate: "2010-07-16",
        },
      ],
    });
  } finally {
    await close();
  }
});

test("GET /movies/:id/screenings adds isEvening and parses movie id", async () => {
  const { deps, getLastMovieId } = createDeps({
    screeningsItems: [
      {
        id: 1,
        movieId: 1,
        startTime: "2025-06-01T10:00:00",
        price: 12.5,
        room: { id: 1, name: "Room A", capacity: 120 },
      },
      {
        id: 2,
        movieId: 1,
        startTime: "2025-06-01T19:00:00",
        price: 12.5,
        room: { id: 2, name: "Room B", capacity: 80 },
      },
    ],
  });
  const { baseUrl, close } = await startServer(deps);

  try {
    const response = await getJson(baseUrl, "/movies/1/screenings");
    assert.equal(response.status, 200);
    assert.equal(getLastMovieId(), 1);
    assert.deepEqual(response.body, {
      ok: true,
      items: [
        {
          id: 1,
          movieId: 1,
          startTime: "2025-06-01T10:00:00",
          price: 12.5,
          room: { id: 1, name: "Room A", capacity: 120 },
          isEvening: false,
        },
        {
          id: 2,
          movieId: 1,
          startTime: "2025-06-01T19:00:00",
          price: 12.5,
          room: { id: 2, name: "Room B", capacity: 80 },
          isEvening: true,
        },
      ],
    });
  } finally {
    await close();
  }
});

test("GET /movies/:id/seances is accepted as alias", async () => {
  const { deps } = createDeps({
    screeningsItems: [
      {
        id: 1,
        movieId: 1,
        startTime: "2025-06-01T20:00:00",
        price: 12.5,
        room: { id: 1, name: "Room A", capacity: 120 },
      },
    ],
  });
  const { baseUrl, close } = await startServer(deps);

  try {
    const response = await getJson(baseUrl, "/movies/1/seances");
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      ok: true,
      items: [
        {
          id: 1,
          movieId: 1,
          startTime: "2025-06-01T20:00:00",
          price: 12.5,
          room: { id: 1, name: "Room A", capacity: 120 },
          isEvening: true,
        },
      ],
    });
  } finally {
    await close();
  }
});

test("GET /movies/:id/screenings returns 400 when movie id is invalid", async () => {
  const { deps } = createDeps();
  const { baseUrl, close } = await startServer(deps);

  try {
    const response = await getJson(baseUrl, "/movies/abc/screenings");
    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { ok: false, error: "Invalid movie id" });
  } finally {
    await close();
  }
});

test("unknown route returns 404", async () => {
  const { deps } = createDeps();
  const { baseUrl, close } = await startServer(deps);

  try {
    const response = await getJson(baseUrl, "/unknown");
    assert.equal(response.status, 404);
    assert.deepEqual(response.body, { ok: false, error: "Not Found" });
  } finally {
    await close();
  }
});

test("unexpected repository error returns 500", async () => {
  const { deps } = createDeps({
    moviesError: new Error("boom"),
  });
  const { baseUrl, close } = await startServer(deps);

  try {
    const response = await getJson(baseUrl, "/movies");
    assert.equal(response.status, 500);
    assert.deepEqual(response.body, {
      ok: false,
      error: "Internal Server Error",
    });
  } finally {
    await close();
  }
});
