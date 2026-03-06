INSERT INTO movies (id, title, description, duration_minutes, rating, release_date)
VALUES
  (1, 'Inception', 'Sci-fi thriller about dreams within dreams.', 148, 'PG-13', '2010-07-16'),
  (2, 'Interstellar', 'Exploration through space and time.', 169, 'PG-13', '2014-11-07'),
  (3, 'The Dark Knight', 'Batman faces the Joker.', 152, 'PG-13', '2008-07-18')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rooms (id, name, capacity)
VALUES
  (1, 'Room A', 120),
  (2, 'Room B', 80)
ON CONFLICT (id) DO NOTHING;

INSERT INTO screenings (id, movie_id, room_id, start_time, price)
VALUES
  (1, 1, 1, '2025-06-01 18:00:00', 12.50),
  (2, 1, 2, '2025-06-01 21:00:00', 12.50),
  (3, 2, 1, '2025-06-02 19:00:00', 13.00),
  (4, 3, 2, '2025-06-03 20:30:00', 11.00)
ON CONFLICT (id) DO NOTHING;
