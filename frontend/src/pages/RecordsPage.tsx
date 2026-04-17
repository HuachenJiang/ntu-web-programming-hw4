import { Alert, Button, Stack, Typography } from '@mui/material';
import { useDeferredValue, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { RecordCard } from '../components/RecordCard';
import { RecordFiltersPanel } from '../components/RecordFiltersPanel';
import { SectionIntro } from '../components/SectionIntro';
import { useAuth } from '../context/AuthContext';
import { useRecordFilters } from '../hooks/useRecordFilters';
import { recordService } from '../services/recordService';
import type { HikeRecord } from '../types/models';

export function RecordsPage() {
  const { user } = useAuth();
  const { filters, setCategory, setQuery, reset } = useRecordFilters();
  const deferredQuery = useDeferredValue(filters.q);
  const [records, setRecords] = useState<HikeRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    recordService
      .listRecords(user.id, {
        ...filters,
        q: deferredQuery,
      })
      .then((response) => {
        setRecords(response.data);
        setError(null);
      })
      .catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : '记录读取失败');
      });
  }, [deferredQuery, filters.category, user]);

  return (
    <Stack spacing={3.5}>
      <SectionIntro
        eyebrow="Archive"
        title="把每次徒步都整理成可回看的路线档案。"
        description="这里的记录列表由 mock service 驱动，已经支持关键字搜索、分类筛选、详情查看与编辑跳转。后续只要替换 service，即可连接真实后端。"
      />
      <RecordFiltersPanel
        filters={filters}
        onQueryChange={setQuery}
        onCategoryChange={setCategory}
        onReset={reset}
      />
      {error && <Alert severity="error">{error}</Alert>}
      {records.length ? (
        <Stack spacing={2.5}>
          {records.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </Stack>
      ) : (
        <Stack
          spacing={1.5}
          sx={{
            p: 4,
            borderRadius: 6,
            textAlign: 'center',
            border: '1px dashed rgba(53, 92, 76, 0.24)',
            bgcolor: 'rgba(255,255,255,0.4)',
          }}
        >
          <Typography variant="h5">还没有符合筛选条件的记录</Typography>
          <Typography color="text.secondary">可以回到地图页建立第一条路线，或者清空筛选再试一次。</Typography>
          <Button component={RouterLink} to="/map" variant="contained" color="secondary">
            去地图页新增记录
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
