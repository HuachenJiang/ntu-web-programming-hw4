import type { ApiResponse } from '../types/api';
import type { HikeRecord, RecordDraft, RecordFilters, RoutePlan, User } from '../types/models';
import { createId } from '../utils/id';
import { demoRecords } from './mockData';
import { readStorage, storageKeys, writeStorage } from './storage';

function readRecords() {
  const records = readStorage<HikeRecord[]>(storageKeys.records, demoRecords);

  if (!records.length) {
    writeStorage(storageKeys.records, demoRecords);
    return demoRecords;
  }

  return records;
}

export const recordService = {
  async listRecords(ownerId: string, filters?: RecordFilters): Promise<ApiResponse<HikeRecord[]>> {
    const records = readRecords().filter((record) => record.ownerId === ownerId);

    const filtered = records.filter((record) => {
      const matchesQuery = filters?.q
        ? [record.title, record.description, record.notes, record.location.name]
            .join(' ')
            .toLowerCase()
            .includes(filters.q.toLowerCase())
        : true;

      const matchesCategory =
        !filters?.category || filters.category === 'all'
          ? true
          : record.category === filters.category;

      return matchesQuery && matchesCategory;
    });

    return {
      success: true,
      message: '记录列表读取成功',
      data: filtered.sort((a, b) => (a.completedDate < b.completedDate ? 1 : -1)),
      meta: {
        total: filtered.length,
      },
    };
  },

  async getRecordById(id: string): Promise<ApiResponse<HikeRecord>> {
    const record = readRecords().find((item) => item.id === id);

    if (!record) {
      throw new Error('找不到这条徒步记录');
    }

    return {
      success: true,
      message: '记录读取成功',
      data: record,
    };
  },

  async createRecord(
    draft: RecordDraft,
    routePlan: RoutePlan,
    owner: User,
  ): Promise<ApiResponse<HikeRecord>> {
    const now = new Date().toISOString();
    const record: HikeRecord = {
      id: createId('record'),
      title: draft.title,
      description: draft.description,
      category: draft.category,
      completedDate: draft.completedDate,
      status: draft.status,
      distanceKm: routePlan.distanceKm,
      durationMinutes: routePlan.durationMinutes,
      ownerId: owner.id,
      notes: draft.notes,
      createdAt: now,
      updatedAt: now,
      location: {
        id: createId('location'),
        name: routePlan.destination.label,
        address: routePlan.destination.address,
        latitude: routePlan.destination.lat,
        longitude: routePlan.destination.lng,
        category: 'destination',
        placeId: routePlan.destination.placeId,
      },
      routePlan,
    };

    const nextRecords = [record, ...readRecords()];
    writeStorage(storageKeys.records, nextRecords);

    return {
      success: true,
      message: '记录保存成功',
      data: record,
    };
  },

  async updateRecord(id: string, draft: RecordDraft): Promise<ApiResponse<HikeRecord>> {
    const records = readRecords();
    const index = records.findIndex((item) => item.id === id);

    if (index < 0) {
      throw new Error('找不到要更新的记录');
    }

    const nextRecord: HikeRecord = {
      ...records[index],
      ...draft,
      updatedAt: new Date().toISOString(),
    };

    const nextRecords = [...records];
    nextRecords[index] = nextRecord;
    writeStorage(storageKeys.records, nextRecords);

    return {
      success: true,
      message: '记录更新成功',
      data: nextRecord,
    };
  },
};
