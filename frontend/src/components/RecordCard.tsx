import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import { Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { HikeRecord } from '../types/models';
import { formatDate, formatDistance, formatDuration } from '../utils/formatters';
import { categoryOptions, statusOptions } from '../utils/constants';

interface RecordCardProps {
  record: HikeRecord;
}

export function RecordCard({ record }: RecordCardProps) {
  const categoryLabel =
    categoryOptions.find((option) => option.value === record.category)?.label ?? record.category;
  const statusLabel = statusOptions.find((option) => option.value === record.status)?.label ?? record.status;

  return (
    <Card className="grain-shell">
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" gap={1} flexWrap="wrap">
            <Stack spacing={0.8}>
              <Typography variant="h5">{record.title}</Typography>
              <Typography color="text.secondary">{record.description}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={categoryLabel} color="primary" variant="outlined" />
              <Chip label={statusLabel} color="secondary" />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} color="text.secondary">
            <Stack direction="row" spacing={1} alignItems="center">
              <FmdGoodOutlinedIcon fontSize="small" />
              <Typography variant="body2">{record.location.name}</Typography>
            </Stack>
            <Typography variant="body2">{formatDate(record.completedDate)}</Typography>
            <Typography variant="body2">{formatDistance(record.distanceKm)}</Typography>
            <Typography variant="body2">{formatDuration(record.durationMinutes)}</Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {record.notes}
          </Typography>

          <Stack direction="row" spacing={1.5}>
            <Button component={RouterLink} to={`/records/${record.id}`} variant="contained">
              查看详情
            </Button>
            <Button
              component={RouterLink}
              to={`/records/${record.id}/edit`}
              variant="outlined"
              startIcon={<EditRoundedIcon />}
            >
              编辑记录
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
