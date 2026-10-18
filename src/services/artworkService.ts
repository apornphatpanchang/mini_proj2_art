import type { Artwork } from '../types/artwork';

const ARTWORKS_URL = '/data/artworks.json';

// GET /data/artworks.json
export async function fetchArtworks(): Promise<Artwork[]> {
  const response = await fetch(ARTWORKS_URL);

  if (!response.ok) {
    throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลรายการผลงานศิลปะ');
  }

  return response.json();
}

// ไฟล์ static ไม่มี /:id จึงดึงทั้งรายการแล้วค้นหาด้วย id
export async function fetchArtworkById(id: string): Promise<Artwork> {
  const artworks = await fetchArtworks();
  const artwork = artworks.find((item) => String(item.id) === String(id));

  if (!artwork) {
    throw new Error(`ไม่พบข้อมูลผลงานรหัส ${id}`);
  }

  return artwork;
}