import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Check, X } from 'lucide-react';
import type { Artwork } from '../../types/artwork';

interface AddArtworksModalProps {
  artworks: Artwork[];
  savedIds: string[];
  exhibitionIds: string[];
  onConfirm: (ids: string[]) => void;
  onClose: () => void;
}

export default function AddArtworksModal({
  artworks,
  savedIds,
  exhibitionIds,
  onConfirm,
  onClose,
}: AddArtworksModalProps) {
  // รายการที่ติ๊กไว้ชั่วคราว ยังไม่เขียนเข้า Zustand จนกว่าจะกดยืนยัน
  const [selected, setSelected] = useState<string[]>([]);

  const candidates = useMemo(
    () =>
      artworks.filter(
        (art) => savedIds.includes(art.id) && !exhibitionIds.includes(art.id)
      ),
    [artworks, savedIds, exhibitionIds]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="เลือกผลงานจาก Collection"
        className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100">
          <div>
            <h2 className="font-serif font-bold text-lg text-neutral-900 tracking-tight">
              เลือกจาก Collection ของคุณ
            </h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              แสดงเฉพาะผลงานที่ยังไม่อยู่ในนิทรรศการ ({candidates.length} ชิ้น)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-600 transition-colors"
            title="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {candidates.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-neutral-700">
                ไม่มีผลงานที่เพิ่มได้แล้ว
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                ผลงานใน Collection อยู่ในนิทรรศการหมดแล้ว หรือยังไม่ได้บันทึกผลงานไว้
              </p>
              <Link
                to="/"
                onClick={onClose}
                className="inline-block mt-4 px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
              >
                ไปเลือกชมที่ Gallery
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {candidates.map((art) => {
                const isOn = selected.includes(art.id);
                return (
                  <button
                    key={art.id}
                    type="button"
                    aria-pressed={isOn}
                    onClick={() => toggle(art.id)}
                    className={`text-left rounded-lg p-1.5 border-2 transition-colors ${
                      isOn
                        ? 'border-black bg-neutral-50'
                        : 'border-transparent hover:border-neutral-200'
                    }`}
                  >
                    <div className="relative aspect-[4/5] rounded-md overflow-hidden bg-neutral-100">
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-2 left-2 w-5 h-5 rounded flex items-center justify-center border ${
                          isOn
                            ? 'bg-black border-black text-white'
                            : 'bg-white/90 border-neutral-300'
                        }`}
                      >
                        {isOn && <Check className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-neutral-900 truncate">
                      {art.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate">{art.artist}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-neutral-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={selected.length === 0}
            className="px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-40 disabled:hover:bg-black"
          >
            เพิ่ม {selected.length} ผลงาน
          </button>
        </div>
      </div>
    </div>
  );
}
