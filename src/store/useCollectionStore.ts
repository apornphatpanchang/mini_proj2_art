import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CollectionState {
  savedIds: string[];
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      toggleSave: (id: string) => {
        const { savedIds } = get();
        const exists = savedIds.includes(id);
        set({
          savedIds: exists
            ? savedIds.filter((item) => item !== id)
            : [...savedIds, id],
        });
      },
      isSaved: (id: string) => get().savedIds.includes(id),
    }),
    {
      name: 'art-collection-storage', // บันทึกใน LocalStorage ตามข้อกำหนด
    }
  )
);