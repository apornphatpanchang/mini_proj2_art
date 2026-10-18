import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import type { Artwork } from '../../types/artwork';

interface SlideshowModalProps {
  title: string;
  note: string;
  artworks: Artwork[];
  onClose: () => void;
}

const AUTOPLAY_MS = 5000;

export default function SlideshowModal({
  title,
  note,
  artworks,
  onClose,
}: SlideshowModalProps) {
  // index 0 = หน้าเปิด, 1..n = ผลงานลำดับที่ 1..n (สถานะชั่วคราว ใช้ useState พอ)
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const last = artworks.length;

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, last)), [last]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  // ล็อกการเลื่อนของหน้าเบื้องหลัง
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // คีย์ลัด: Esc ปิด, ← → เปลี่ยนภาพ, Space เล่น/หยุด
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === ' ') {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, next, prev]);

  // Autoplay: เปลี่ยนภาพทุก 5 วินาที และหยุดเองเมื่อถึงภาพสุดท้าย
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (index >= last) setPlaying(false);
      else setIndex(index + 1);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [playing, index, last]);

  // โหลดภาพถัดไปรอไว้ก่อน (slide ถัดไป = artworks[index])
  useEffect(() => {
    const upcoming = artworks[index];
    if (upcoming) {
      const img = new Image();
      img.src = upcoming.image;
    }
  }, [index, artworks]);

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta < -50) next();
    else if (delta > 50) prev();
  };

  const art = index > 0 ? artworks[index - 1] : null;
  const displayTitle = title.trim() || 'นิทรรศการของฉัน';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`สไลด์โชว์ ${displayTitle}`}
      className="fixed inset-0 z-[60] bg-neutral-950 text-white flex flex-col"
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs text-neutral-400 tabular-nums">
          {index === 0 ? 'หน้าเปิด' : `${index} / ${last}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title={playing ? 'หยุดเล่นอัตโนมัติ' : 'เล่นอัตโนมัติ'}
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="ปิด (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="flex-1 min-h-0 flex items-center justify-between gap-2 px-2 sm:px-6">
        <button
          onClick={prev}
          disabled={index === 0}
          className="p-2 sm:p-3 rounded-full hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
          title="ก่อนหน้า"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex-1 min-w-0 h-full flex flex-col items-center justify-center text-center">
          {art === null ? (
            <div className="max-w-xl px-4">
              <h2 className="font-serif font-bold text-3xl sm:text-5xl tracking-tight">
                {displayTitle}
              </h2>
              {note.trim() && (
                <p className="mt-5 text-sm sm:text-base text-neutral-300 leading-relaxed whitespace-pre-line">
                  {note}
                </p>
              )}
              <p className="mt-8 text-xs text-neutral-500">
                {last} ผลงาน · กด → หรือปัดนิ้วเพื่อเริ่มชม
              </p>
            </div>
          ) : (
            <>
              <img
                key={art.id}
                src={art.image}
                alt={art.title}
                className="max-w-full max-h-[68vh] object-contain"
              />
              <div className="mt-4 px-4">
                <h3 className="font-serif font-bold text-lg sm:text-xl">{art.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  {art.artist}
                  {art.year ? `, ${art.year}` : ''}
                </p>
              </div>
            </>
          )}
        </div>

        <button
          onClick={next}
          disabled={index === last}
          className="p-2 sm:p-3 rounded-full hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
          title="ถัดไป"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="h-6" />
    </div>
  );
}
