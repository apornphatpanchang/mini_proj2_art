import { create } from 'zustand';
import { persist } from 'zustand/middleware';


export const TITLE_MAX = 60;
export const NOTE_MAX = 300;

export interface Exhibition {
  id: string;
  title: string;
  note: string;
  /** เก็บเฉพาะ ID ของผลงาน เรียงตามลำดับในนิทรรศการ ไม่เก็บข้อมูลผลงาน */
  artworkIds: string[];
  createdAt: number;
}

interface LegacyExhibitionState {
  exhibitionIds?: unknown;
  title?: unknown;
  note?: unknown;
}

interface ExhibitionState {
  exhibitions: Exhibition[];

  /** สร้างนิทรรศการว่าง แล้วคืน id ของอันที่สร้าง */
  createExhibition: (title?: string) => string;
  deleteExhibition: (id: string) => void;
  updateExhibition: (
  id: string,
  patch: Partial<Pick<Exhibition, 'title' | 'note' | 'artworkIds'>>
) => void;
  addArtworks: (id: string, artworkIds: string[]) => void;
  removeArtwork: (id: string, artworkId: string) => void;
  moveArtwork: (id: string, from: number, to: number) => void;
  /** ตั้งว่าผลงานชิ้นนี้อยู่ในนิทรรศการไหนบ้าง (ใช้กับ modal เลือกนิทรรศการในหน้า Detail) */
  setArtworkExhibitions: (artworkId: string, exhibitionIds: string[]) => void;
}

const newId = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const updateOne = (
  list: Exhibition[],
  id: string,
  fn: (exhibition: Exhibition) => Exhibition
): Exhibition[] => list.map((e) => (e.id === id ? fn(e) : e));

// แปลงข้อมูลเก่า (exhibitionIds / title / note) เป็นนิทรรศการแรก
const migrateLegacy = (persisted: unknown): Exhibition[] => {
  if (typeof persisted !== 'object' || persisted === null) return [];
  const old = persisted as LegacyExhibitionState;
  const ids = Array.isArray(old.exhibitionIds)
    ? old.exhibitionIds.filter((x): x is string => typeof x === 'string')
    : [];
  const title = typeof old.title === 'string' ? old.title : '';
  const note = typeof old.note === 'string' ? old.note : '';
  if (ids.length === 0 && !title.trim() && !note.trim()) return [];
  return [
    {
      id: newId(),
      title: (title.trim() || 'นิทรรศการของฉัน').slice(0, TITLE_MAX),
      note: note.slice(0, NOTE_MAX),
      artworkIds: ids,
      createdAt: Date.now(),
    },
  ];
};

export const useExhibitionStore = create<ExhibitionState>()(
  persist(
    (set) => ({
      exhibitions: [],

      createExhibition: (title = '') => {
        const id = newId();
        set((state) => ({
          exhibitions: [
            ...state.exhibitions,
            {
              id,
              title: title.slice(0, TITLE_MAX),
              note: '',
              artworkIds: [],
              createdAt: Date.now(),
            },
          ],
        }));
        return id;
      },

      deleteExhibition: (id) =>
        set((state) => ({
          exhibitions: state.exhibitions.filter((e) => e.id !== id),
        })),

      updateExhibition: (id, patch) =>
        set((state) => ({
          exhibitions: updateOne(state.exhibitions, id, (e) => ({
            ...e,
            title: patch.title !== undefined ? patch.title.slice(0, TITLE_MAX) : e.title,
            note: patch.note !== undefined ? patch.note.slice(0, NOTE_MAX) : e.note,
            artworkIds:
              patch.artworkIds !== undefined
                ? Array.from(new Set(patch.artworkIds))
                : e.artworkIds,
          })),
        })),

      addArtworks: (id, artworkIds) =>
        set((state) => ({
          exhibitions: updateOne(state.exhibitions, id, (e) => ({
            ...e,
            artworkIds: Array.from(new Set([...e.artworkIds, ...artworkIds])),
          })),
        })),

      removeArtwork: (id, artworkId) =>
        set((state) => ({
          exhibitions: updateOne(state.exhibitions, id, (e) => ({
            ...e,
            artworkIds: e.artworkIds.filter((x) => x !== artworkId),
          })),
        })),

      moveArtwork: (id, from, to) =>
        set((state) => ({
          exhibitions: updateOne(state.exhibitions, id, (e) => {
            const size = e.artworkIds.length;
            if (from === to || from < 0 || to < 0 || from >= size || to >= size) {
              return e;
            }
            const next = [...e.artworkIds];
            const [moved] = next.splice(from, 1);
            if (moved === undefined) return e;
            next.splice(to, 0, moved);
            return { ...e, artworkIds: next };
          }),
        })),

      setArtworkExhibitions: (artworkId, exhibitionIds) =>
        set((state) => ({
          exhibitions: state.exhibitions.map((e) => {
            const want = exhibitionIds.includes(e.id);
            const has = e.artworkIds.includes(artworkId);
            if (want && !has) {
              return { ...e, artworkIds: [...e.artworkIds, artworkId] };
            }
            if (!want && has) {
              return {
                ...e,
                artworkIds: e.artworkIds.filter((x) => x !== artworkId),
              };
            }
            return e;
          }),
        })),
    }),
    {
      name: 'art-exhibition-storage',
      version: 1,
      migrate: (persisted, version) => {
        const exhibitions =
          version < 1
            ? migrateLegacy(persisted)
            : (persisted as { exhibitions?: Exhibition[] } | null)?.exhibitions ?? [];
        return { exhibitions } as ExhibitionState;
      },
    }
  )
);