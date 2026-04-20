import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import type { AuthCredentials, RegisterPayload } from '../types/auth';

interface AuthFormCardProps {
  mode: 'login' | 'register';
  values: AuthCredentials | RegisterPayload;
  errors: Partial<Record<string, string>>;
  submitError: string | null;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function AuthFormCard({
  mode,
  values,
  errors,
  submitError,
  onChange,
  onSubmit,
  isSubmitting,
}: AuthFormCardProps) {
  const isRegister = mode === 'register';

  return (
    <Card className="grain-shell float-in">
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2.5}>
          <Stack spacing={1}>
            <Typography variant="overline" color="secondary.main" fontWeight={700}>
              {isRegister ? 'Create Basecamp' : 'Trail Access'}
            </Typography>
            <Typography variant="h3">{isRegister ? '建立你的徒步基地' : '继续你的路线采集'}</Typography>
            <Typography color="text.secondary">
              {isRegister ? '注册后会直接进入地图页，并使用真实后端保存登录状态。' : '登录后可直接进入地图页建立与管理你的徒步记录。'}
            </Typography>
          </Stack>

          {submitError && <Alert severity="error">{submitError}</Alert>}

          {isRegister && (
            <TextField
              label="昵称"
              value={(values as RegisterPayload).name}
              onChange={(event) => onChange('name', event.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name}
            />
          )}

          <TextField
            label="邮箱"
            type="email"
            value={values.email}
            onChange={(event) => onChange('email', event.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
          />
          <TextField
            label="密码"
            type="password"
            value={values.password}
            onChange={(event) => onChange('password', event.target.value)}
            error={Boolean(errors.password)}
            helperText={errors.password}
          />
          <Button variant="contained" color="primary" size="large" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? '处理中...' : isRegister ? '创建账号并进入地图' : '进入地图规划'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
