import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Alert, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { MapMonitorSummary } from '../services/mapMonitorService';

interface MapMonitorPanelProps {
  summary: MapMonitorSummary;
}

function formatLatency(value: number | null) {
  return value === null ? '尚无资料' : `${value} ms`;
}

function formatRate(value: number) {
  return `${value.toFixed(1)}%`;
}

export function MapMonitorPanel({ summary }: MapMonitorPanelProps) {
  return (
    <Card className="grain-shell">
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={1.6}>
          <Stack spacing={0.8}>
            <Typography variant="overline" color="secondary.main" fontWeight={700}>
              Google Monitor
            </Typography>
            <Typography variant="h5">本次 session 的 Maps 请求监控</Typography>
            <Typography color="text.secondary">
              追踪调用量、成功率、失败率、平均延迟与 quota 风险，方便确认 Google API 串接是否稳定。
            </Typography>
          </Stack>

          {summary.quotaRisk && (
            <Alert severity="warning" icon={<WarningAmberRoundedIcon />}>
              目前请求量已接近本地警戒阈值，建议检查是否有重复路线规划或异常重试。
            </Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
            <Chip label={`总请求 ${summary.totalCount}`} color="secondary" variant="outlined" />
            <Chip label={`成功率 ${formatRate(summary.successRate)}`} color="secondary" variant="outlined" />
            <Chip label={`失败率 ${formatRate(summary.errorRate)}`} color="secondary" variant="outlined" />
            <Chip label={`平均延迟 ${formatLatency(summary.averageLatencyMs)}`} color="secondary" variant="outlined" />
          </Stack>

          {summary.latestEvent ? (
            <Typography variant="body2" color="text.secondary">
              最近一次请求：{summary.latestEvent.service} / {summary.latestEvent.status} / {summary.latestEvent.dailyCount}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              尚未发出 Google Maps 请求。生成路线后，这里会开始累计监控资料。
            </Typography>
          )}

          {summary.services.map((service) => (
            <Typography key={service.service} variant="body2" color="text.secondary">
              {service.service}: {service.dailyCount} 次，成功率 {formatRate(service.successRate)}，平均延迟{' '}
              {formatLatency(service.averageLatencyMs)}
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
