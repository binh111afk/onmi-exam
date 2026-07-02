export interface ExamDraft {
  version: string;
  editorMode: string; // "json"
  rawJson: string;
  lastSaved: string; // ISO String
  examTitle: string;
  subject: string;
  draftId: string; // Unique tab/instance identifier to prevent cross-tab conflicts
}

const LOCAL_STORAGE_KEY = 'onmi.teacherstudio.exam.draft';

export const draftService = {
  /**
   * Checks if a draft exists in LocalStorage.
   */
  hasDraft(): boolean {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY) !== null;
    } catch (e) {
      console.error('Cannot access localStorage:', e);
      return false;
    }
  },

  /**
   * Saves the current draft to LocalStorage.
   */
  saveDraft(draft: ExamDraft): boolean {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
      return true;
    } catch (e) {
      console.error('Failed to save draft to localStorage:', e);
      return false;
    }
  },

  /**
   * Loads the draft from LocalStorage.
   */
  loadDraft(): ExamDraft | null {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as ExamDraft;
    } catch (e) {
      console.error('Failed to parse draft from localStorage:', e);
      return null;
    }
  },

  /**
   * Deletes the draft from LocalStorage.
   */
  deleteDraft(): void {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to delete draft from localStorage:', e);
    }
  },

  /**
   * Retrieves the last saved ISO string timestamp.
   */
  getLastSaved(): string | null {
    const draft = this.loadDraft();
    return draft ? draft.lastSaved : null;
  }
};
