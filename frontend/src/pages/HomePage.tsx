import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import TerrainOutlinedIcon from '@mui/icons-material/TerrainOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { MetricCard } from '../components/MetricCard';
import { SectionIntro } from '../components/SectionIntro';
import { appPaths } from '../utils/constants';

const featureCards = [
  {
    title: '地图先行的路线采集',
    description: '用真实 Google Maps 规划徒步起终点，再把路线摘要写入你的阶段性记录。',
    icon: <MapOutlinedIcon />,
  },
  {
    title: '像杂志版面一样整理回忆',
    description: '每次步行不只是距离和时间，也保留你对天气、路感和地形的观察。',
    icon: <CameraAltOutlinedIcon />,
  },
  {
    title: '前后端维持统一资料流',
    description: '登录、地图记录、列表、详情与编辑都统一走真实 REST API 与 PostgreSQL。',
    icon: <ExploreOutlinedIcon />,
  },
];

export function HomePage() {
  return (
    <Stack spacing={{ xs: 5, md: 7 }}>
      <Box
        className="hero-glow float-in"
        sx={{
          position: 'relative',
          p: { xs: 3, md: 5 },
          borderRadius: 8,
          border: '1px solid rgba(53, 92, 76, 0.16)',
          background:
            'linear-gradient(135deg, rgba(255,250,240,0.84), rgba(229, 241, 233, 0.82)), linear-gradient(180deg, rgba(53,92,76,0.08), transparent)',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label="Google Maps + PostgreSQL" color="secondary" />
                <Chip label="JWT Auth + REST API" variant="outlined" color="primary" />
              </Stack>
              <Typography variant="h1" sx={{ fontSize: { xs: '3.2rem', md: '5.4rem' }, maxWidth: 720 }}>
                把路线、地形与徒步笔记收进同一张地图。
              </Typography>
              <Typography variant="h6" color="text.secondary" maxWidth={640} lineHeight={1.7}>
                HikeLog Maps 现在以真实后端运行。你可以注册账号、规划真实路线、建立记录，并在列表与详情页持续管理自己的徒步资料。
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  component={RouterLink}
                  to={appPaths.register}
                  variant="contained"
                  color="secondary"
                  endIcon={<ArrowForwardRoundedIcon />}
                  size="large"
                >
                  开始建立你的徒步基地
                </Button>
                <Button
                  component={RouterLink}
                  to={appPaths.login}
                  variant="outlined"
                  color="primary"
                  size="large"
                >
                  前往登录
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card className="grain-shell" sx={{ transform: { md: 'rotate(-2deg)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <TerrainOutlinedIcon color="secondary" />
                    <Typography variant="h5">本阶段验收重点</Typography>
                  </Stack>
                  <Stack spacing={1.4}>
                    <Typography color="text.secondary">1. 页面可操作，路由导览完整。</Typography>
                    <Typography color="text.secondary">2. 地图可加载、规划真实路线、读取距离与时间。</Typography>
                    <Typography color="text.secondary">3. 登录与记录新增、列表、详情、编辑流程统一接入真实后端。</Typography>
                  </Stack>
                  <Divider />
                  <Typography variant="body2" color="text.secondary">
                    启动完成后可直接注册账号，再进入地图页建立第一条徒步路线。
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <MetricCard label="Routes" value="7 个页面" helper="首页、登录、注册、地图、列表、详情、编辑全覆盖" />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard label="Mode" value="真实地图" helper="Google Maps JavaScript API 与 Directions 接入完成" />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard label="Flow" value="Live API" helper="auth 与 records 统一走真实 backend 与 PostgreSQL" />
        </Grid>
      </Grid>

      <Stack spacing={3}>
        <SectionIntro
          eyebrow="Field Notes"
          title="这一版前端是怎么组织的"
          description="页面层负责叙事与组合，地图加载、路线请求、鉴权状态与记录 API 都拆到 hooks、context 与 services，保持单一真实资料流。"
        />
        <Grid container spacing={2.5}>
          {featureCards.map((card) => (
            <Grid item xs={12} md={4} key={card.title}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 3,
                        bgcolor: 'rgba(53, 92, 76, 0.1)',
                        color: 'primary.main',
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Typography variant="h5">{card.title}</Typography>
                    <Typography color="text.secondary">{card.description}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Stack>
  );
}
