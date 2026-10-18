import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Images,
  Play,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { fetchArtworks } from '../services/artworkService';
import { useCollectionStore } from '../store/useCollectionStore';
import {
  NOTE_MAX,
  TITLE_MAX,
  useExhibitionStore,
} from '../store/useExhibitionStore';
import type { Exhibition } from '../store/useExhibitionStore';
import AddArtworksModal from '../components/exhibition/AddArtworksModal';
import SlideshowModal from '../components/exhibition/SlideshowModal';
import type { Artwork } from '../types/artwork';

const moveItem = (list: string[], from: number, to: number): string[] => {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return list;
  }
  const next = [...list];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return list;
  next.splice(to, 0, moved);
  return next;
};

const sameList = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((value, i) => value === b[i]);

// หน้านอก: หานิทรรศการจาก id ใน URL แล้วส่งให้ตัวแก้ไข (key ทำให้ฉบับร่างรีเซ็ตเมื่อเปลี่ยนนิทรรศการ)
export default function ExhibitionEditPage() {
  const { id } = useParams<{ id: string }>();
  const exhibition = useExhibitionStore((state) =>
    state.exhibitions.find((e) => e.id === id)
  );

  if (!exhibition) {
    return (
      <div className="text-left">
        <div className="py-20 text-center bg-white rounded-2xl border border-neutral-100 my-6">
          <Images className="w-12 h-12 mx-auto mb-3 text-neutral-300 stroke-[1.5]" />
          <p className="text-sm font-medium text-neutral-700">ไม่พบนิทรรศการนี้</p>
          <p className="text-xs text-neutral-400 mt-1">
            นิทรรศการอาจถูกลบไปแล้ว หรือข้อมูลถูกเก็บไว้ในเบราว์เซอร์เครื่องอื่น
          </p>
          <Link
            to="/exhibition"
            className="inline-block mt-4 px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
          >
            กลับไปหน้านิทรรศการ
          </Link>
        </div>
      </div>
    );
  }

  return <ExhibitionEditor key={exhibition.id} exhibition={exhibition} />;
}

function ExhibitionEditor({ exhibition }: { exhibition: Exhibition }) {
  const navigate = useNavigate();

  // Client State (Zustand): ค่าที่บันทึกแล้ว
  const updateExhibition = useExhibitionStore((state) => state.updateExhibition);
  const deleteExhibition = useExhibitionStore((state) => state.deleteExhibition);
  const savedIds = useCollectionStore((state) => state.savedIds);

  // Server State (TanStack Query): queryKey เดียวกับหน้าอื่น ใช้ cache ร่วมกัน
  const { data: artworks, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['artworks'],
    queryFn: fetchArtworks,
  });

  // ฉบับร่าง: แก้ได้อิสระจนกว่าจะกดบันทึก
  const [title, setTitle] = useState(exhibition.title);
  const [note, setNote] = useState(exhibition.note);
  const [artworkIds, setArtworkIds] = useState<string[]>(exhibition.artworkIds);
  const [justSaved, setJustSaved] = useState(false);

  // UI State ชั่วคราว
  const [showAdd, setShowAdd] = useState(false);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const isDirty =
    title !== exhibition.title ||
    note !== exhibition.note ||
    !sameList(artworkIds, exhibition.artworkIds);

  // กันออกจากหน้าตอนมีการแก้ไขที่ยังไม่ได้บันทึก
  const leaveAllowed = useRef(false);
  const blocker = useBlocker(() => isDirty && !leaveAllowed.current);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('มีการแก้ไขที่ยังไม่ได้บันทึก ออกจากหน้านี้เลยไหม?')) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker]);

  // กันปิดแท็บหรือรีเฟรชตอนมีการแก้ไขที่ยังไม่ได้บันทึก
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  // ข้อความ "บันทึกแล้ว" แสดงสั้นๆ
  useEffect(() => {
    if (!justSaved) return;
    const timer = window.setTimeout(() => setJustSaved(false), 2500);
    return () => window.clearTimeout(timer);
  }, [justSaved]);

  const artworkMap = useMemo(() => {
    const map = new Map<string, Artwork>();
    (artworks ?? []).forEach((art) => map.set(art.id, art));
    return map;
  }, [artworks]);

  const items = artworkIds.map((artId) => ({
    id: artId,
    art: artworkMap.get(artId) ?? null,
  }));
  const slideArtworks = items.flatMap((item) => (item.art ? [item.art] : []));

  const handleSave = () => {
    updateExhibition(exhibition.id, { title, note, artworkIds });
    setJustSaved(true);
  };

  const handleDiscard = () => {
    setTitle(exhibition.title);
    setNote(exhibition.note);
    setArtworkIds(exhibition.artworkIds);
  };

  const handleDrop = (to: number) => {
    if (dragIndex !== null && dragIndex !== to) {
      setArtworkIds((prev) => moveItem(prev, dragIndex, to));
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDelete = () => {
    if (window.confirm('ลบนิทรรศการนี้ทั้งอัน?')) {
      leaveAllowed.current = true;
      deleteExhibition(exhibition.id);
      navigate('/exhibition');
    }
  };

  const displayTitle = title.trim() || 'นิทรรศการไม่มีชื่อ';

  return (
    <div className="text-left">
      <Link
        to="/exhibition"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-3"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        นิทรรศการทั้งหมด
      </Link>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
        <h1
          className={`text-3xl sm:text-4xl font-serif font-bold tracking-tight flex items-center gap-3 min-w-0 ${
            title.trim() ? 'text-neutral-900' : 'text-neutral-400'
          }`}
        >
          <span className="truncate">{displayTitle}</span>
          <span className="shrink-0 text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAdd(true)}
            disabled={!artworks}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-neutral-800 border border-neutral-300 rounded-full text-xs font-semibold hover:bg-neutral-100 transition-colors disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            เพิ่มผลงาน
          </button>
          <button
            onClick={() => setSlideshowOpen(true)}
            disabled={slideArtworks.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-neutral-800 border border-neutral-300 rounded-full text-xs font-semibold hover:bg-neutral-100 transition-colors disabled:opacity-40"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            สไลด์โชว์
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="inline-flex items-center gap-2 px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-40 disabled:hover:bg-black"
          >
            <Save className="w-3.5 h-3.5" />
            บันทึก
          </button>
        </div>
      </div>

      {/* สถานะการบันทึก */}
      <div className="min-h-5 mb-3" aria-live="polite">
        {isDirty ? (
          <p className="text-xs text-amber-600">มีการแก้ไขที่ยังไม่ได้บันทึก</p>
        ) : justSaved ? (
          <p className="inline-flex items-center gap-1 text-xs text-emerald-600">
            <Check className="w-3.5 h-3.5" />
            บันทึกแล้ว
          </p>
        ) : null}
      </div>

      {/* ชื่อและคำอธิบาย: ข้อมูลที่ผู้ใช้เขียนเอง ไม่ต้องรอ API จึงแสดงทันที */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-5 mb-6 space-y-4">
        <div>
          <label
            htmlFor="exhibition-title"
            className="block text-xs font-medium text-neutral-500 mb-1"
          >
            ชื่อนิทรรศการ
          </label>
          <input
            id="exhibition-title"
            type="text"
            value={title}
            maxLength={TITLE_MAX}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น Impressionism ของฉัน"
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-neutral-400 transition-shadow"
          />
          <p className="text-[11px] text-neutral-400 mt-1 text-right">
            {title.length}/{TITLE_MAX}
          </p>
        </div>

        <div>
          <label
            htmlFor="exhibition-note"
            className="block text-xs font-medium text-neutral-500 mb-1"
          >
            คำอธิบายนิทรรศการ (Curator's note)
          </label>
          <textarea
            id="exhibition-note"
            value={note}
            maxLength={NOTE_MAX}
            rows={3}
            onChange={(e) => setNote(e.target.value)}
            placeholder="เล่าสั้นๆ ว่านิทรรศการนี้เกี่ยวกับอะไร"
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-neutral-400 transition-shadow resize-none"
          />
          <p className="text-[11px] text-neutral-400 mt-1 text-right">
            {note.length}/{NOTE_MAX}
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-neutral-200/70 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="py-16 text-center bg-white rounded-2xl border border-neutral-100 my-6">
          <p className="text-sm font-medium text-neutral-700">
            ไม่สามารถโหลดข้อมูลผลงานได้ กรุณาลองใหม่อีกครั้ง
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
      )}

      {/* รายการผลงาน */}
      {artworks &&
        (items.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-neutral-100 my-6">
            <Images className="w-12 h-12 mx-auto mb-3 text-neutral-300 stroke-[1.5]" />
            <p className="text-sm font-medium text-neutral-700">
              ยังไม่มีผลงานในนิทรรศการนี้
            </p>
            {savedIds.length > 0 ? (
              <>
                <p className="text-xs text-neutral-400 mt-1">
                  เลือกผลงานจาก Collection ของคุณมาจัดแสดงได้เลย
                </p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="inline-block mt-4 px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  เพิ่มผลงาน
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-neutral-400 mt-1">
                  กดหัวใจที่ผลงานใน Gallery ก่อน แล้วกลับมาเลือกมาใส่นิทรรศการที่นี่
                </p>
                <Link
                  to="/"
                  className="inline-block mt-4 px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  ไปเลือกชมที่ Gallery
                </Link>
              </>
            )}
          </div>
        ) : (
          <ol className="space-y-2.5">
            {items.map(({ id: artId, art }, index) => (
              <li
                key={artId}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverIndex(index);
                }}
                onDrop={() => handleDrop(index)}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className={`flex items-center gap-3 bg-white rounded-xl border p-2.5 transition-colors ${
                  overIndex === index && dragIndex !== null && dragIndex !== index
                    ? 'border-black'
                    : 'border-neutral-200'
                } ${dragIndex === index ? 'opacity-40' : ''}`}
              >
                <GripVertical
                  className="w-4 h-4 text-neutral-300 shrink-0 cursor-grab"
                  aria-hidden="true"
                />
                <span className="w-5 text-xs text-neutral-400 tabular-nums text-center shrink-0">
                  {index + 1}
                </span>

                {art ? (
                  <>
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-12 h-14 rounded-md object-cover bg-neutral-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {art.title}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">{art.artist}</p>
                    </div>
                  </>
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-red-600">ไม่พบผลงานนี้</p>
                    <p className="text-xs text-neutral-400 truncate">ID: {artId}</p>
                  </div>
                )}

                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => setArtworkIds((prev) => moveItem(prev, index, index - 1))}
                    disabled={index === 0}
                    className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title="เลื่อนขึ้น"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setArtworkIds((prev) => moveItem(prev, index, index + 1))}
                    disabled={index === items.length - 1}
                    className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title="เลื่อนลง"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setArtworkIds((prev) => prev.filter((x) => x !== artId))}
                    className="p-1.5 rounded hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-colors"
                    title="เอาออกจากนิทรรศการ"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        ))}

      <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          ลบนิทรรศการนี้
        </button>

        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              onClick={handleDiscard}
              className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              ยกเลิกการแก้ไข
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="inline-flex items-center gap-2 px-5 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-40 disabled:hover:bg-black"
          >
            <Save className="w-3.5 h-3.5" />
            บันทึก
          </button>
        </div>
      </div>

      {showAdd && artworks && (
        <AddArtworksModal
          artworks={artworks}
          savedIds={savedIds}
          exhibitionIds={artworkIds}
          onConfirm={(ids) => {
            setArtworkIds((prev) => Array.from(new Set([...prev, ...ids])));
            setShowAdd(false);
          }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {slideshowOpen && slideArtworks.length > 0 && (
        <SlideshowModal
          title={title}
          note={note}
          artworks={slideArtworks}
          onClose={() => setSlideshowOpen(false)}
        />
      )}
    </div>
  );
}