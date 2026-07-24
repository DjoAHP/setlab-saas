export interface Song {
  id: string;
  title: string;
  position: number;
  time?: number;
  tonalite?: string;
}

export interface Setlist {
  id: string;
  bandName: string;
  stageTimeLimit: number | null;
  songs: Song[];
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}