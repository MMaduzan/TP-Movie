import assert from "node:assert/strict";
import test from "node:test";
import { isEveningScreening } from "../Domain/ScreeningService.js";

test("isEveningScreening returns true when screening starts at 18:00+", () => {
  const result = isEveningScreening({
    id: 1,
    movieId: 1,
    startTime: "2025-06-01T19:00:00.000Z",
    price: 12.5,
    room: { id: 1, name: "Room A", capacity: 120 },
  });

  assert.equal(result, true);
});

test("isEveningScreening returns false when screening starts before 18:00", () => {
  const result = isEveningScreening({
    id: 2,
    movieId: 1,
    startTime: "2025-06-01T10:00:00.000Z",
    price: 12.5,
    room: { id: 2, name: "Room B", capacity: 80 },
  });

  assert.equal(result, false);
});
