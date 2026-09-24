import type { PublishedDocument } from '../types/published';

const LOCAL_STORAGE_KEY = 'omni_published_docs';

const readAll = (): PublishedDocument[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PublishedDocument[]) : [];
  } catch (e) {
    console.error('Cannot read published documents:', e);
    return [];
  }
};

const writeAll = (list: PublishedDocument[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Cannot save published documents:', e);
  }
};

export const publishedDocService = {
  /** Upsert theo id — xuất bản lại ghi đè bản cũ (điều kiện Gatekeeper) */
  publish(doc: PublishedDocument): void {
    try {
      const list = readAll();
      const idx = list.findIndex(x => x.id === doc.id);
      if (idx >= 0) list[idx] = doc;
      else list.push(doc);
      writeAll(list);
    } catch (e) {
      console.error('Cannot publish document:', e);
    }
  },

  list(): PublishedDocument[] {
    return readAll();
  },

  getById(id: string): PublishedDocument | undefined {
    return readAll().find(x => x.id === id);
  },
};
