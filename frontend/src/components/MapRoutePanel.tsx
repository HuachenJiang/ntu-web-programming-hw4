import AltRouteRoundedIcon from '@mui/icons-material/AltRouteRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import type { RoutePlan } from '../types/models';
import { formatDistance, formatDuration } from '../utils/formatters';

interface MapRoutePanelProps {
  origin: string;
  destination: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onPlanRoute: () => void;
  routePlan: RoutePlan | null;
  routeError: string | null;
  loadError: string | null;
  isPlanning: boolean;
}

export function MapRoutePanel({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onPlanRoute,
  routePlan,
  routeError,
  loadError,
  isPlanning,
}: MapRoutePanelProps) {
  const badges = useMemo(
    () =>
      routePlan
        ? [
            { icon: <AltRouteRoundedIcon fontSize="small" />, text: formatDistance(routePlan.distanceKm) },
            { icon: <ExploreRoundedIcon fontSize="small" />, text: formatDuration(routePlan.durationMinutes) },
            { icon: <PlaceRoundedIcon fontSize="small" />, text: routePlan.destination.label },
          ]
        : [],
    [routePlan],
  );

  return (
    <Card className="grain-shell">
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.2}>
          <Stack spacing={1}>
            <Typography variant="overline" color="secondary.main" fontWeight={700}>
              Route Desk
            </Typography>
            <Typography variant="h4">规划这次徒步的起终点</Typography>
            <Typography color="text.secondary">
              使用真实 Google Maps 规划步行路线。只有成功取得真实路线后，才能保存这次徒步记录。
            </Typography>
          </Stack>

          {loadError && <Alert severity="error">{loadError}</Alert>}
          {routeError && <Alert severity="error">{routeError}</Alert>}

          <TextField label="起点" value={origin} onChange={(event) => onOriginChange(event.target.value)} />
          <TextField
            label="终点"
            value={destination}
            onChange={(event) => onDestinationChange(event.target.value)}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button variant="contained" onClick={onPlanRoute} disabled={isPlanning || Boolean(loadError)}>
              {isPlanning ? '规划中...' : '生成步行路线'}
            </Button>
          </Stack>

          {routePlan && (
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {badges.map((badge) => (
                  <Chip
                    key={badge.text}
                    icon={badge.icon}
                    label={badge.text}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                从 {routePlan.origin.label} 出发，步行至 {routePlan.destination.label}。系统将把这段真实路线摘要写入记录资料。
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
