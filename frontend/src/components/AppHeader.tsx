import TerrainOutlinedIcon from '@mui/icons-material/TerrainOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { appPaths } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

interface AppHeaderProps {
  showPrivateLinks?: boolean;
}

export function AppHeader({ showPrivateLinks = false }: AppHeaderProps) {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const isActive = (path: string) =>
    location.pathname === path || (path !== appPaths.home && location.pathname.startsWith(path));

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(53, 92, 76, 0.12)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: 1.5, gap: 2, alignItems: 'center' }}>
          <Stack
            component={RouterLink}
            to={appPaths.home}
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ color: 'text.primary' }}
          >
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                width: 44,
                height: 44,
                borderRadius: 3,
              }}
            >
              <TerrainOutlinedIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" lineHeight={1}>
                HikeLog Maps
              </Typography>
              <Typography variant="caption" color="text.secondary">
                徒步路线记录系统
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button
              component={RouterLink}
              to={appPaths.home}
              color={isActive(appPaths.home) ? 'secondary' : 'inherit'}
              startIcon={<MenuBookRoundedIcon />}
            >
              首页
            </Button>
            {showPrivateLinks && (
              <>
                <Button
                  component={RouterLink}
                  to={appPaths.map}
                  color={isActive(appPaths.map) ? 'secondary' : 'inherit'}
                  startIcon={<TravelExploreRoundedIcon />}
                >
                  地图规划
                </Button>
                <Button
                  component={RouterLink}
                  to={appPaths.records}
                  color={isActive(appPaths.records) ? 'secondary' : 'inherit'}
                  startIcon={<MenuBookRoundedIcon />}
                >
                  徒步记录
                </Button>
              </>
            )}
          </Stack>

          {isAuthenticated ? (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={700}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  已登录
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  void logout();
                }}
                startIcon={<LogoutRoundedIcon />}
              >
                退出
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to={appPaths.login} variant="text">
                登录
              </Button>
              <Button component={RouterLink} to={appPaths.register} variant="contained" color="secondary">
                注册
              </Button>
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
