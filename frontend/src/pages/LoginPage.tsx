import DirectionsWalkRoundedIcon from '@mui/icons-material/DirectionsWalkRounded';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthFormCard } from '../components/AuthFormCard';
import { useAuth } from '../context/AuthContext';
import type { AuthCredentials } from '../types/auth';
import { appPaths } from '../utils/constants';
import { validateLogin } from '../utils/validators';

export function LoginPage() {
  const [values, setValues] = useState<AuthCredentials>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof AuthCredentials, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit() {
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(values);
      navigate(location.state?.from ?? appPaths.map, { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '登录失败');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Grid container spacing={4} alignItems="center">
      <Grid item xs={12} md={6}>
        <Stack spacing={2.5} className="float-in">
          <Typography variant="overline" color="secondary.main" fontWeight={700}>
            Demo Access
          </Typography>
          <Typography variant="h2">用一套 mock 登录态，把地图流程完整跑一遍。</Typography>
          <Typography color="text.secondary" lineHeight={1.8}>
            phase1 先验证页面与导航，再在 phase2 接上 JWT 与后端 API。你现在可以直接用示例账号登录，体验路线规划、
            记录新增、列表浏览和编辑流程。
          </Typography>
          <Box
            sx={{
              p: 3,
              borderRadius: 6,
              border: '1px solid rgba(53, 92, 76, 0.14)',
              background: 'rgba(255,255,255,0.45)',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <DirectionsWalkRoundedIcon color="secondary" />
              <div>
                <Typography fontWeight={700}>示例账号</Typography>
                <Typography color="text.secondary">demo@hikelog.test / trail123</Typography>
              </div>
            </Stack>
          </Box>
        </Stack>
      </Grid>
      <Grid item xs={12} md={6}>
        <AuthFormCard
          mode="login"
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
