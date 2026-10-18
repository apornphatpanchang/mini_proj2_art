import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Images, Play, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { fetchArtworks } from '../services/artworkService';
import { useExhibitionStore } from '../store/useExhibitionStore';
import SlideshowModal from '../components/exhibition/SlideshowModal';
import type { Artwork } from '../types/artwork';

interface CoverProps {
  images: string[];
  loading: boolean;
  hasArtworks: boolean;
}

// ภาพปกนิทรรศการ: โมเสกจากผลงานชิ้นแรกๆ
function Cover({ images, loading, hasArtworks }: CoverProps) {
  if (loading && hasArtworks) {
    return <div className="aspect-[16/10] bg-neutral-200/70 animate-pulse" aria-busy="true" />;
  }
  if (images.length === 0) {
    return (
      <div className="aspect-[16/10] bg-neutral-100 flex items-center justify-center">
        <Images className="w-8 h-8 text-neutral-300 stroke-[1.5]" />
      </div>
    );
  }
  return (
    <div
      className={`aspect-[16/10] grid auto-rows-fr gap-0.5 bg-neutral-100 ${
        images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
      }`}
    >
      {images.map((src, i) => (
        <img key={i} src={src} alt="" className="w-full h-full object-cover" />
      ))}
    </div>
  );
}

export default function ExhibitionPage() {
  const navigate = useNavigate();

  // Client State: รายการนิทรรศการ (ID + ข้อความที่ผู้ใช้เขียนเอง)
  const exhibitions = useExhibitionStore((state) => state.exhibitions);
  const createExhibition = useExhibitionStore((state) => state.createExhibition);
  const deleteExhibition = useExhibitionStore((state) => state.deleteExhibition);

  // Server State: ใช้ queryKey เดียวกับหน้าอื่น จึงใช้ cache ร่วมกัน
  const { data: artworks, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['artworks'],
    queryFn: fetchArtworks,
  });

  const [slideshowId, setSlideshowId] = useState<string | null>(null);

  const artworkMap = useMemo(
    () => new Map<string, Artwork>((artworks ?? []).map((art) => [art.id, art] as const)),
    [artworks]
  );

  const resolve = (ids: string[]): Artwork[] =>
    ids.flatMap((id) => {
      const art = artworkMap.get(id);
      return art ? [art] : [];
    });

  const handleCreate = () => {
    const id = createExhibition();
    navigate(`/exhibition/${id}`);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`ลบนิทรรศการ "${title.trim() || 'ไม่มีชื่อ'}"?`)) {
      deleteExhibition(id);
    }
  };

  const slideshowExhibition = exhibitions.find((e) => e.id === slideshowId) ?? null;
  const slideshowArtworks = slideshowExhibition
    ? resolve(slideshowExhibition.artworkIds)
    : [];

  return (
    <div className="text-left">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h1 className="text-4xl font-serif font-bold tracking-tight text-neutral-900 flex items-center gap-3">
          Exhibition
          <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
            {exhibitions.length} {exhibitions.length === 1 ? 'item' : 'items'}
          </span>
        </h1>

        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          สร้างนิทรรศการ
        </button>
      </div>

      {isError && (
        <div className="flex items-center justify-between gap-3 bg-white rounded-xl border border-neutral-200 px-4 py-3 mb-4">
          <p className="text-xs text-neutral-600">
            โหลดภาพปกไม่สำเร็จ อาจเกิดจากการเชื่อมต่ออินเทอร์เน็ตมีปัญหา
          </p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            ลองใหม่
          </button>
        </div>
      )}

      {exhibitions.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-neutral-100 my-6">
          <Images className="w-12 h-12 mx-auto mb-3 text-neutral-300 stroke-[1.5]" />
          <p className="text-sm font-medium text-neutral-700">ยังไม่มีนิทรรศการ</p>
          <p className="text-xs text-neutral-400 mt-1">
            สร้างนิทรรศการแรกของคุณ แล้วเลือกผลงานจาก Collection มาจัดแสดง
          </p>
          <button
            onClick={handleCreate}
            className="inline-block mt-4 px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
          >
            สร้างนิทรรศการ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exhibitions.map((ex) => {
            const resolved = resolve(ex.artworkIds);
            const images = resolved.slice(0, 4).map((art) => art.image);
            const displayTitle = ex.title.trim() || 'นิทรรศการไม่มีชื่อ';

            return (
              <div
                key={ex.id}
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm"
              >
                <Link to={`/exhibition/${ex.id}`} className="block group">
                  <Cover
                    images={images}
                    loading={isLoading}
                    hasArtworks={ex.artworkIds.length > 0}
                  />
                  <div className="px-4 pt-3">
                    <h3
                      className={`font-serif font-bold text-base leading-snug truncate ${
                        ex.title.trim() ? 'text-neutral-900' : 'text-neutral-400'
                      } group-hover:underline`}
                    >
                      {displayTitle}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {ex.artworkIds.length} ผลงาน
                    </p>
                  </div>
                </Link>

                <div className="px-4 pt-3 pb-4 flex gap-2">
                  <button
                    onClick={() => setSlideshowId(ex.id)}
                    disabled={resolved.length === 0}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                    title="สไลด์โชว์"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    สไลด์โชว์
                  </button>
                  <button
                    onClick={() => handleDelete(ex.id, ex.title)}
                    className="p-2 rounded-full text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="ลบนิทรรศการ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {slideshowExhibition && slideshowArtworks.length > 0 && (
        <SlideshowModal
          title={slideshowExhibition.title}
          note={slideshowExhibition.note}
          artworks={slideshowArtworks}
          onClose={() => setSlideshowId(null)}
        />
      )}
    </div>
  );
}