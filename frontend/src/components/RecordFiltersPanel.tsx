import { Button, Card, CardContent, MenuItem, Stack, TextField } from '@mui/material';
import type { RecordFilters } from '../types/models';
import { categoryOptions } from '../utils/constants';

interface RecordFiltersPanelProps {
  filters: RecordFilters;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: RecordFilters['category']) => void;
  onReset: () => void;
}

export function RecordFiltersPanel({
  filters,
  onQueryChange,
  onCategoryChange,
  onReset,
}: RecordFiltersPanelProps) {
  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="搜索标题、地点或心得"
            value={filters.q}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <TextField
            select
            label="分类"
            value={filters.category}
            onChange={(event) => onCategoryChange(event.target.value as RecordFilters['category'])}
            sx={{ minWidth: { md: 220 } }}
          >
            <MenuItem value="all">全部分类</MenuItem>
            {categoryOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={onReset}>
            重置筛选
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
