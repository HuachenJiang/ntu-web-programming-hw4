import HikingRoundedIcon from '@mui/icons-material/HikingRounded';
import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      sx={{ minHeight: '60vh' }}
    >
      <HikingRoundedIcon color="secondary" sx={{ fontSize: 56 }} />
      <Typography variant="h2">这条路径暂时不存在</Typography>
      <Typography color="text.secondary" maxWidth={520}>
        你可以回到首页重新进入地图或记录页。phase1 的可用页面已经全部放在顶部导航里。
      </Typography>
      <Button component={RouterLink} to="/" variant="contained" color="secondary">
        返回首页
      </Button>
    </Stack>
  );
}
