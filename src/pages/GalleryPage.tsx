import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchArtworks } from '../services/artworkService';
import { Link, Outlet } from 'react-router';
import Masonry from 'react-masonry-css';
import { Heart, Search, RefreshCw } from 'lucide-react';
import { useCollectionStore } from '../store/useCollectionStore';
import SkeletonCard from '../components/SkeletonCard';

const PAGE_SIZE = 8;

export default function GalleryPage() {
  const savedIds = useCollectionStore((state) => state.savedIds);
  const toggleSave = useCollectionStore((state) => state.toggleSave);

  const {
    data: artworks,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['artworks'],
    queryFn: fetchArtworks,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredArtworks = useMemo(() => {
    if (!artworks) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return artworks;
    return artworks.filter(
      (art) =>
        art.title.toLowerCase().includes(term) ||
        art.artist.toLowerCase().includes(term)
    );
  }, [artworks, searchTerm]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm]);

  const visibleArtworks = filteredArtworks.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArtworks.length;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + PAGE_SIZE);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, filteredArtworks.length]);

  const breakpointColumns = {
    default: 6,
    1600: 5,
    1280: 4,
    1024: 3,
    768: 2,
    640: 1,
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-3xl font-serif font-bold tracking-tight text-neutral-900">
            Art Gallery
          </h1>
        </div>
        <Masonry
          breakpointCols={breakpointColumns}
          className="flex -ml-4 w-auto"
          columnClassName="pl-4 bg-clip-padding"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} height={200 + ((i * 47) % 160)} />
          ))}
        </Masonry>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-20 text-center bg-white rounded-2xl border border-neutral-100 my-6">
        <p className="text-sm font-medium text-neutral-700">
          ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          อาจเกิดจากการเชื่อมต่ออินเทอร์เน็ตมีปัญหา
        </p>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-4xl font-serif font-bold tracking-tight text-neutral-900">
          Art Gallery
        </h1>
      </div>
      <br />

      <div className="relative mb-6 max-w-md">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ค้นหาชื่อผลงานหรือศิลปิน เช่น Monet, Starry Night..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-neutral-200 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-neutral-400 transition-shadow"
        />
      </div>

      {filteredArtworks.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-neutral-100 my-6">
          <p className="text-sm font-medium text-neutral-700">
            ไม่พบผลงานที่ตรงกับคำค้นหา "{searchTerm}"
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="inline-block mt-4 px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
          >
            ล้างคำค้นหา
          </button>
        </div>
      ) : (
        <>
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex -ml-4 w-auto"
            columnClassName="pl-4 bg-clip-padding"
          >
            {visibleArtworks.map((art) => {
              const isSaved = savedIds.includes(art.id);

              return (
                <div key={art.id} className="mb-4 group relative overflow-hidden rounded cursor-pointer shadow-sm">
                  <Link to={`/artwork/${art.id}`}>
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

                    <div
                      className={`absolute top-3 right-3 transition-all duration-300 z-20 ${
                        isSaved ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSave(art.id);
                        }}
                        className={`p-2 rounded-full backdrop-blur-md transition-all transform hover:scale-110 ${
                          isSaved
                            ? 'bg-black/60 shadow-md'
                            : 'bg-black/40 hover:bg-black/70'
                        }`}
                        title={isSaved ? 'นำออกจาก Collection' : 'บันทึกเข้า Collection'}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isSaved
                              ? 'fill-red-500 text-red-500'
                              : 'text-white hover:text-red-400'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white z-0">
                      <h3 className="font-serif font-bold text-base leading-snug drop-shadow">{art.title}</h3>
                      <p className="text-[11px] text-neutral-300 mt-0.5 font-light drop-shadow">{art.artist}</p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </Masonry>

          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              <button
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="px-5 py-2 bg-neutral-200/70 hover:bg-neutral-300 text-neutral-700 rounded-full text-xs font-semibold transition-colors"
              >
                โหลดเพิ่มเติม ({filteredArtworks.length - visibleCount} รายการ)
              </button>
            </div>
          )}
        </>
      )}

      <Outlet />
    </div>
  );
}