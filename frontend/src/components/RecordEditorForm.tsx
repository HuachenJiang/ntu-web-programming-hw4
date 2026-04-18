import { Button, Card, CardContent, MenuItem, Stack, TextField } from '@mui/material';
import type { RecordDraft } from '../types/models';
import { categoryOptions, statusOptions } from '../utils/constants';

interface RecordEditorFormProps {
  values: RecordDraft;
  errors: Partial<Record<keyof RecordDraft, string>>;
  submitLabel: string;
  onChange: <K extends keyof RecordDraft>(field: K, value: RecordDraft[K]) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  isDisabled?: boolean;
}

export function RecordEditorForm({
  values,
  errors,
  submitLabel,
  onChange,
  onSubmit,
  isSubmitting,
  isDisabled,
}: RecordEditorFormProps) {
  return (
    <Card className="grain-shell">
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="路线标题"
            value={values.title}
            onChange={(event) => onChange('title', event.target.value)}
            error={Boolean(errors.title)}
            helperText={errors.title}
          />
          <TextField
            label="简短描述"
            value={values.description}
            onChange={(event) => onChange('description', event.target.value)}
            multiline
            minRows={2}
          />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              select
              fullWidth
              label="分类"
              value={values.category}
              onChange={(event) => onChange('category', event.target.value as RecordDraft['category'])}
            >
              {categoryOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="状态"
              value={values.status}
              onChange={(event) => onChange('status', event.target.value as RecordDraft['status'])}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            label="完成日期"
            type="date"
            value={values.completedDate}
            onChange={(event) => onChange('completedDate', event.target.value)}
            InputLabelProps={{ shrink: true }}
            error={Boolean(errors.completedDate)}
            helperText={errors.completedDate}
          />
          <TextField
            label="心得与观察"
            value={values.notes}
            onChange={(event) => onChange('notes', event.target.value)}
            multiline
            minRows={4}
            error={Boolean(errors.notes)}
            helperText={errors.notes}
          />
          <Button variant="contained" color="secondary" onClick={onSubmit} disabled={isSubmitting || isDisabled}>
            {isSubmitting ? '处理中...' : submitLabel}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
