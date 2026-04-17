import type { RecordDraft } from '../types/models';

export function createDefaultRecordDraft(): RecordDraft {
  return {
    title: '',
    description: '',
    category: 'ridge',
    completedDate: new Date().toISOString().slice(0, 10),
    status: 'completed',
    notes: '',
  };
}
