export interface Note {
  id: string;
  userId: string;
  date: string;
  content: string;
  createdAt: string;
}

export interface CreateNoteInput {
  date: string;
  content: string;
}

export interface UpdateNoteInput {
  id: string;
  date?: string;
  content?: string;
}

export interface NoteRecord {
  id: string;
  user_id: string;
  date: string;
  content: string;
  created_at: string;
}
