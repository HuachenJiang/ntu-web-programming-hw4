import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Alert, Button, Chip, Grid, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { RecordRoutePreview } from '../components/RecordRoutePreview';
import { SectionIntro } from '../components/SectionIntro';
import { recordService } from '../services/recordService';
import type { HikeRecord } from '../types/models';
import { categoryOptions, statusOptions } from '../utils/constants';
import { formatDate, formatDistance, formatDuration, formatDateTime } from '../utils/formatters';

export function RecordDetailPage() {
  const { id = '' } = useParams();
  const [record, setRecord] = useState<HikeRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    recordService
      .getRecordById(id)
      .then((response) => {
        setRecord(response.data);
        setError(null);
      })
      .catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : '读取详情失败');
      });
  }, [id]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!record) {
    return <Typography color="text.secondary">正在读取记录详情...</Typography>;
  }

  const categoryLabel =
    categoryOptions.find((option) => option.value === record.category)?.label ?? record.category;
  const statusLabel = statusOptions.find((option) => option.value === record.status)?.label ?? record.status;

  return (
    <Stack spacing={3.5}>
      <SectionIntro
        eyebrow="Record Detail"
        title={record.title}
        description={record.description}
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} flexWrap="wrap">
        <Chip label={categoryLabel} color="primary" variant="outlined" />
        <Chip label={statusLabel} color="secondary" />
        <Chip label={formatDistance(record.distanceKm)} />
        <Chip label={formatDuration(record.durationMinutes)} />
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <RecordRoutePreview routePlan={record.routePlan} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack spacing={2.5}>
            <Stack
              spacing={1.3}
              sx={{
                p: 3,
                borderRadius: 6,
                bgcolor: 'rgba(255,255,255,0.48)',
                border: '1px solid rgba(53, 92, 76, 0.12)',
              }}
            >
              <Typography variant="h5">路线摘要</Typography>
              <Typography color="text.secondary">完成日期：{formatDate(record.completedDate)}</Typography>
              <Typography color="text.secondary">起点：{record.routePlan.origin.address}</Typography>
              <Typography color="text.secondary">终点：{record.routePlan.destination.address}</Typography>
              <Typography color="text.secondary">地点标签：{record.location.name}</Typography>
              <Typography color="text.secondary">最后更新：{formatDateTime(record.updatedAt)}</Typography>
            </Stack>
            <Stack
              spacing={1.3}
              sx={{
                p: 3,
                borderRadius: 6,
                bgcolor: 'rgba(255,247,237,0.58)',
                border: '1px solid rgba(199, 119, 75, 0.14)',
              }}
            >
              <Typography variant="h5">徒步心得</Typography>
              <Typography color="text.secondary" lineHeight={1.8}>
                {record.notes}
              </Typography>
            </Stack>
            <Button component={RouterLink} to={`/records/${record.id}/edit`} variant="contained" startIcon={<EditRoundedIcon />}>
              编辑这条记录
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
