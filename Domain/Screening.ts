export type ScreeningRoom = {
  id: number;
  name: string;
  capacity: number;
};

export type Screening = {
  id: number;
  movieId: number;
  startTime: string;
  price: number;
  room: ScreeningRoom;
};
