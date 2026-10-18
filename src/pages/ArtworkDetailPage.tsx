import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchArtworks, fetchArtworkById } from '../services/artworkService';
import {
  X, SkipBack, SkipForward, Heart, Images, Check, Maximize2, Minimize2,
} from 'lucide-react';
import { useCollectionStore } from '../store/useCollectionStore';
import { useExhibitionStore } from '../store/useExhibitionStore';
import ExhibitionPickerModal from '../components/exhibition/ExhibitionPickerModal';

export default function ArtworkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  
  const basePath = location.pathname.startsWith('/collection') ? '/collection' : '/';
  const artworkPath = (artId: string) =>
    `${basePath === '/' ? '' : basePath}/artwork/${artId}`;

  const savedIds = useCollectionStore((state) => state.savedIds);
  const toggleSave = useCollectionStore((state) => state.toggleSave);
  const exhibitions = useExhibitionStore((state) => state.exhibitions);
  const [pickerOpen, setPickerOpen] = useState(false);


  const [zoomedId, setZoomedId] = useState<string | null>(null);
  const zoomed = zoomedId === id;

  const { data: art, isLoading, isError, refetch } = useQuery({
    queryKey: ['artwork', id],
    queryFn: () => fetchArtworkById(id!),
    enabled: !!id,
  });

  const { data: allArtworks } = useQuery({
    queryKey: ['artworks'],
    queryFn: fetchArtworks,
  });


  const navList =
    basePath === '/collection'
      ? allArtworks?.filter((item) => savedIds.includes(item.id) || item.id === id)
      : allArtworks;

  const currentIndex = navList?.findIndex((item) => item.id === id) ?? -1;
  const prevArt = currentIndex > 0 ? navList?.[currentIndex - 1] : null;
  const nextArt =
    currentIndex >= 0 && currentIndex < (navList?.length ?? 0) - 1
      ? navList?.[currentIndex + 1]
      : null;

  const handleClose = () => navigate(basePath);
  const goTo = (artId: string) => navigate(artworkPath(artId), { replace: true });

  // คีย์ลัด: Esc = ปิด (ถ้าขยายรูปอยู่ย่อก่อน), ← → = ภาพก่อนหน้า/ถัดไป
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (pickerOpen) return;
      if (e.key === 'Escape') {
        if (zoomed) setZoomedId(null);
        else handleClose();
      } else if (e.key === 'ArrowLeft' && prevArt) goTo(prevArt.id);
      else if (e.key === 'ArrowRight' && nextArt) goTo(nextArt.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 text-neutral-500 font-medium">กำลังโหลดรายละเอียด...</div>
      </div>
    );
  }

  if (isError || !art) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
      className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}>          ไม่พบข้อมูลผลงานศิลปะ{' '}
          <button onClick={() => refetch()} className="ml-4 underline text-black">ลองใหม่</button>
          <button onClick={handleClose} className="ml-4 underline text-black">ปิดหน้าต่าง</button>
        </div>
      </div>
    );
  }

  const isSaved = savedIds.includes(art.id);
  const exhibitionCount = exhibitions.filter((ex) => ex.artworkIds.includes(art.id)).length;
  const inExhibition = exhibitionCount > 0;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
        onClick={handleClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100">
            <h2 className="font-serif font-bold text-lg text-neutral-900 tracking-tight">
              Secret of Art
            </h2>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-600 transition-colors"
              title="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          
          <div className="p-6 md:p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            <div className="relative rounded-xl overflow-hidden bg-neutral-100 shadow-sm border border-neutral-100">
              <img
                src={art.image}
                alt={art.title}
                onClick={() => setZoomedId(art.id)}
                className="w-full h-auto max-h-[420px] object-cover block cursor-zoom-in"
              />

              
              <button
                onClick={() => setZoomedId(art.id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow text-neutral-700 transition-colors"
                title="ขยายรูป"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <div className="absolute bottom-0 left-0 bg-white/95 backdrop-blur-md p-4 pr-8 rounded-tr-2xl shadow-md border-t border-r border-neutral-100 max-w-[85%]">
                <h3 className="font-serif font-bold text-lg text-neutral-900 leading-tight">{art.title}</h3>
                <p className="text-xs text-neutral-500 mt-0.5 font-light">{art.artist}</p>
              </div>
            </div>

           
            <div className="flex flex-col justify-between h-full space-y-6">
              <div className="bg-[#F8F8F9] rounded-xl p-5 space-y-3 text-xs text-neutral-700">
                <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500 font-medium">ชื่อผลงาน</span>
                  <span className="font-semibold text-neutral-900">{art.title}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500 font-medium">ศิลปิน</span>
                  <span className="font-semibold text-neutral-900">{art.artist}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500 font-medium">ปีที่สร้าง</span>
                  <span className="font-semibold text-neutral-900">{art.year}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500 font-medium">เทคนิค</span>
                  <span className="font-semibold text-neutral-900">{art.medium}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-neutral-500 font-medium">ขนาด</span>
                  <span className="font-semibold text-neutral-900">{art.dimensions}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-neutral-900 mb-2">เรื่องราว</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-light text-justify">
                  {art.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  onClick={() => toggleSave(art.id)}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-colors shadow-sm ${
                    isSaved
                      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                      : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                  {isSaved ? 'บันทึกใน Collection แล้ว' : 'บันทึกเข้า Collection'}
                </button>

                
                  {basePath === '/collection' && isSaved && (
                    <button
                      onClick={() => setPickerOpen(true)}
                      className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-colors shadow-sm border ${
                        inExhibition
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                      }`}
                    >
                      {inExhibition ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Images className="w-3.5 h-3.5" />
                      )}
                      {inExhibition ? `อยู่ใน ${exhibitionCount} นิทรรศการ` : 'เพิ่มเข้านิทรรศการ'}
                    </button>
                  )}
              </div>
            </div>
          </div>

          
          <div className="px-6 py-3.5 border-t border-neutral-200 flex items-center justify-between bg-white">
            <div>
              <h5 className="font-bold text-xs text-neutral-900">{art.title}</h5>
              <p className="text-[10px] text-neutral-400 font-light">{art.artist}</p>
            </div>

            <div className="flex items-center gap-1 text-neutral-700">
              <button
                onClick={() => prevArt && goTo(prevArt.id)}
                disabled={!prevArt}
                className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="รูปก่อนหน้า"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              <button
                onClick={() => nextArt && goTo(nextArt.id)}
                disabled={!nextArt}
                className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="รูปถัดไป"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </div>

     
      {zoomed && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomedId(null)}
        >
          <button
            onClick={() => setZoomedId(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
            title="ย่อรูป"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <img
            src={art.image}
            alt={art.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {pickerOpen && (
        <ExhibitionPickerModal
          artworkId={art.id}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}