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
            Trail Access
          </Typography>
          <Typography variant="h2">登录后进入地图页，开始建立真实徒步记录。</Typography>
          <Typography color="text.secondary" lineHeight={1.8}>
            登录成功后，系统会以 JWT 恢复你的身份，并统一从后端读取与保存记录资料。
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
                <Typography fontWeight={700}>统一运行模式</Typography>
                <Typography color="text.secondary">登录、地图、记录列表、详情与编辑全部接到真实后端。</Typography>
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
