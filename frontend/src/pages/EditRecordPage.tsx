import { Alert, Grid, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RecordEditorForm } from '../components/RecordEditorForm';
import { RecordRoutePreview } from '../components/RecordRoutePreview';
import { SectionIntro } from '../components/SectionIntro';
import { recordService } from '../services/recordService';
import type { HikeRecord, RecordDraft } from '../types/models';
import { validateRecordDraft } from '../utils/validators';

export function EditRecordPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<HikeRecord | null>(null);
  const [draft, setDraft] = useState<RecordDraft | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof RecordDraft, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    recordService
      .getRecordById(id)
      .then((response) => {
        setRecord(response.data);
        setDraft({
          title: response.data.title,
          description: response.data.description,
          category: response.data.category,
          completedDate: response.data.completedDate,
          status: response.data.status,
          notes: response.data.notes,
        });
        setError(null);
      })
      .catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : '读取记录失败');
      });
  }, [id]);

  async function handleSubmit() {
    if (!draft || !record) {
      return;
    }

    const nextErrors = validateRecordDraft(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await recordService.updateRecord(record.id, draft);
      navigate(`/records/${response.data.id}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : '更新记录失败');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!record || !draft) {
    return <Typography color="text.secondary">正在载入编辑表单...</Typography>;
  }

  return (
    <Stack spacing={3.5}>
      <SectionIntro
        eyebrow="Edit Record"
        title="调整这条路线的标题、分类和心得"
        description="编辑页沿用 phase1 的 mock data 模式，但已经具备完整的读取与回写流程。"
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <RecordEditorForm
            values={draft}
            errors={errors}
            isSubmitting={isSubmitting}
            submitLabel="保存修改"
            onChange={(field, value) => setDraft((previous) => (previous ? { ...previous, [field]: value } : previous))}
            onSubmit={handleSubmit}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <RecordRoutePreview routePlan={record.routePlan} />
        </Grid>
      </Grid>
    </Stack>
  );
}
