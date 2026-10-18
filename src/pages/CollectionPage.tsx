import { useQuery } from '@tanstack/react-query';
import { fetchArtworks } from '../services/artworkService';
import { useCollectionStore } from '../store/useCollectionStore';
import { Link, Outlet } from 'react-router';
import Masonry from 'react-masonry-css';
import { Heart } from 'lucide-react';
import SkeletonCard from '../components/SkeletonCard';


// กำหนดจำนวนคอลัมน์ยืดหยุ่นตามความกว้างของหน้าจอ
const breakpointColumns = {
  default: 6, // จอใหญ่มาก (Ultra-wide / 2K / 4K) -> 6 คอลัมน์เต็มตา
  1600: 5,    // จอเดสก์ท็อปขนาดใหญ่ (1600px ขึ้นไป) -> 5 คอลัมน์
  1280: 4,    // จอโน้ตบุ๊ก/คอมพิวเตอร์ทั่วไป (1280px) -> 4 คอลัมน์
  1024: 3,    // จอแท็บเล็ตแนวนอน (1024px) -> 3 คอลัมน์
  768: 2,     // จอแท็บเล็ตแนวตั้ง (768px) -> 2 คอลัมน์
  640: 1      // จอมือถือ (น้อยกว่า 640px) -> 1 คอลัมน์
};
export default function CollectionPage() {
  const savedIds = useCollectionStore((state) => state.savedIds);
  const toggleSave = useCollectionStore((state) => state.toggleSave);

  const { data: artworks, isLoading, isError, refetch } = useQuery({
    queryKey: ['artworks'],
    queryFn: fetchArtworks,
    staleTime: 1000 * 60 * 5,
  });

  const savedArtworks = artworks?.filter((art) => savedIds.includes(art.id)) ?? [];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-serif font-bold tracking-tight text-neutral-900 flex items-center gap-3">
          My Collection
          <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
            {savedArtworks.length} {savedArtworks.length === 1 ? 'item' : 'items'}
          </span>
        </h1>
      </div>

            {isLoading ? (
        <Masonry
          breakpointCols={breakpointColumns}
          className="flex -ml-4 w-auto"
          columnClassName="pl-4 bg-clip-padding"
        >
          {Array.from({ length: Math.max(savedIds.length, 3) }).map((_, i) => (
            <SkeletonCard key={i} height={200 + ((i * 47) % 160)} />
          ))}
        </Masonry>
      ) : isError ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-neutral-100 my-6">
          <p className="text-sm font-medium text-neutral-700">โหลดข้อมูลไม่สำเร็จ</p>
          <button
            onClick={() => refetch()}
            className="inline-block mt-4 px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      ) : savedArtworks.length === 0 ? (


       
        <div className="py-20 text-center text-neutral-400 bg-white rounded-2xl border border-neutral-100 my-6">
          <Heart className="w-12 h-12 mx-auto mb-3 text-neutral-300 stroke-[1.5]" />
          <p className="text-sm font-medium text-neutral-700">ยังไม่มีผลงานที่บันทึกไว้ใน Collection</p>
          <p className="text-xs text-neutral-400 mt-1">กดไอคอนหัวใจที่ภาพผลงานเพื่อบันทึกเก็บไว้ดูที่นี่</p>
          <Link
            to="/"
            className="inline-block mt-4 px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
          >
            ไปเลือกชมที่ Gallery
          </Link>
        </div>
      ) : (
        <Masonry
          breakpointCols={breakpointColumns}
          className="flex -ml-4 w-auto"
          columnClassName="pl-4 bg-clip-padding"
        >
          {savedArtworks.map((art) => (
            <div key={art.id} className="mb-4 group relative overflow-hidden rounded cursor-pointer shadow-sm">
              <Link to={`/collection/artwork/${art.id}`}>
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

                
                <div className="absolute top-3 right-3 z-20">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSave(art.id);
                    }}
                    className="p-2 rounded-full backdrop-blur-md bg-black/60 shadow-md transition-all transform hover:scale-110"
                    title="นำออกจาก Collection"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white z-0">
                  <h3 className="font-serif font-bold text-base leading-snug drop-shadow">{art.title}</h3>
                  <p className="text-[11px] text-neutral-300 mt-0.5 font-light drop-shadow">{art.artist}</p>
                </div>
              </Link>
            </div>
          ))}
        </Masonry>
      )}

      
      <Outlet />
    </div>
  );
}