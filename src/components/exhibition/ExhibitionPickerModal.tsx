import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { TITLE_MAX, useExhibitionStore } from '../../store/useExhibitionStore';

interface ExhibitionPickerModalProps {
  artworkId: string;
  onClose: () => void;
}

export default function ExhibitionPickerModal({
  artworkId,
  onClose,
}: ExhibitionPickerModalProps) {
  const exhibitions = useExhibitionStore((state) => state.exhibitions);
  const setArtworkExhibitions = useExhibitionStore((state) => state.setArtworkExhibitions);
  const createExhibition = useExhibitionStore((state) => state.createExhibition);
  const addArtworks = useExhibitionStore((state) => state.addArtworks);

  // รายการที่ติ๊กไว้ชั่วคราว ยังไม่เขียนเข้า Zustand จนกว่าจะกดบันทึก
  const [selected, setSelected] = useState<string[]>(() =>
    exhibitions.filter((e) => e.artworkIds.includes(artworkId)).map((e) => e.id)
  );
  const [newTitle, setNewTitle] = useState('');

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

  const handleSave = () => {
    setArtworkExhibitions(artworkId, selected);
    const title = newTitle.trim();
    if (title) {
      const newId = createExhibition(title);
      addArtworks(newId, [artworkId]);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-end sm:items-center justify-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="เลือกนิทรรศการ"
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100">
          <div>
            <h2 className="font-serif font-bold text-lg text-neutral-900 tracking-tight">
              เพิ่มเข้านิทรรศการ
            </h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              ติ๊กนิทรรศการที่ต้องการให้ผลงานนี้อยู่
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

        <div className="p-6 overflow-y-auto space-y-4">
          {exhibitions.length === 0 ? (
            <p className="text-xs text-neutral-500 text-center py-4">
              ยังไม่มีนิทรรศการ สร้างอันแรกด้านล่างได้เลย
            </p>
          ) : (
            <ul className="space-y-1.5">
              {exhibitions.map((ex) => {
                const isOn = selected.includes(ex.id);
                return (
                  <li key={ex.id}>
                    <button
                      type="button"
                      aria-pressed={isOn}
                      onClick={() => toggle(ex.id)}
                      className={`w-full flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 text-left transition-colors ${
                        isOn
                          ? 'border-black bg-neutral-50'
                          : 'border-transparent hover:border-neutral-200'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 ${
                          isOn
                            ? 'bg-black border-black text-white'
                            : 'bg-white border-neutral-300'
                        }`}
                      >
                        {isOn && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <span
                        className={`flex-1 min-w-0 text-sm truncate ${
                          ex.title.trim() ? 'text-neutral-900 font-medium' : 'text-neutral-400'
                        }`}
                      >
                        {ex.title.trim() || 'นิทรรศการไม่มีชื่อ'}
                      </span>
                      <span className="text-[11px] text-neutral-400 shrink-0">
                        {ex.artworkIds.length} ผลงาน
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="pt-1">
            <label
              htmlFor="new-exhibition-title"
              className="block text-xs font-medium text-neutral-500 mb-1"
            >
              หรือสร้างนิทรรศการใหม่ (ไม่บังคับ)
            </label>
            <input
              id="new-exhibition-title"
              type="text"
              value={newTitle}
              maxLength={TITLE_MAX}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="ชื่อนิทรรศการใหม่"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-neutral-400 transition-shadow"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              จะสร้างและใส่ผลงานนี้ให้เมื่อกดบันทึก
            </p>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-neutral-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}