
import type { Artwork } from '../types/artwork';

const API_BASE_URL = 'http://localhost:3000';

// HTTP Endpoint: GET /artworks
export async function fetchArtworks(): Promise<Artwork[]> {
  const response = await fetch(`${API_BASE_URL}/artworks`);

  if (!response.ok) {
    throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลรายการผลงานศิลปะ');
  }

  return response.json();
}

// HTTP Endpoint: GET /artworks/:id
export async function fetchArtworkById(id: string): Promise<Artwork> {
  const response = await fetch(`${API_BASE_URL}/artworks/${id}`);

  if (!response.ok) {
    throw new Error(`ไม่พบข้อมูลผลงานรหัส ${id}`);
  }

  return response.json();
}
