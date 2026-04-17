import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthFormCard } from '../components/AuthFormCard';
import { useAuth } from '../context/AuthContext';
import type { RegisterPayload } from '../types/auth';
import { appPaths } from '../utils/constants';
import { validateRegister } from '../utils/validators';

export function RegisterPage() {
  const [values, setValues] = useState<RegisterPayload>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterPayload, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit() {
    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register(values);
      navigate(appPaths.map, { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '注册失败');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Grid container spacing={4} alignItems="center">
      <Grid item xs={12} md={6}>
        <Stack spacing={2.5} className="float-in">
          <Typography variant="overline" color="secondary.main" fontWeight={700}>
            New Basecamp
          </Typography>
          <Typography variant="h2">先建立自己的徒步档案，再进入地图记录第一条路线。</Typography>
          <Typography color="text.secondary" lineHeight={1.8}>
            这个注册流程目前写入本地 mock storage，用来验证 auth context、路由保护和表单校验。
            后续只需要把 service 层切换到真实 API，就能保留页面与状态结构。
          </Typography>
          <Box
            sx={{
              p: 3,
              borderRadius: 6,
              border: '1px solid rgba(199, 119, 75, 0.16)',
              background: 'rgba(255, 247, 237, 0.65)',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PersonAddAlt1RoundedIcon color="secondary" />
              <div>
                <Typography fontWeight={700}>本阶段目标</Typography>
                <Typography color="text.secondary">优先确保页面与 mock 流程顺畅，不在此阶段接后端。</Typography>
              </div>
            </Stack>
          </Box>
        </Stack>
      </Grid>
      <Grid item xs={12} md={6}>
        <AuthFormCard
          mode="register"
          values={values}
          errors={errors}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onChange={(field, value) => setValues((previous) => ({ ...previous, [field]: value }))}
          onSubmit={handleSubmit}
        />
      </Grid>
    </Grid>
  );
}
