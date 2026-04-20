import BookmarkAddedRoundedIcon from '@mui/icons-material/BookmarkAddedRounded';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import NearMeRoundedIcon from '@mui/icons-material/NearMeRounded';
import { Alert, Grid, Stack, Typography } from '@mui/material';
import { startTransition, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapCanvas } from '../components/MapCanvas';
import { MapMonitorPanel } from '../components/MapMonitorPanel';
import { MapRoutePanel } from '../components/MapRoutePanel';
import { MetricCard } from '../components/MetricCard';
import { RecordEditorForm } from '../components/RecordEditorForm';
import { SectionIntro } from '../components/SectionIntro';
import { useAuth } from '../context/AuthContext';
import { useGoogleMapsLoader } from '../hooks/useGoogleMapsLoader';
import { useMapMonitorSummary } from '../hooks/useMapMonitorSummary';
import { useRoutePlanner } from '../hooks/useRoutePlanner';
import { recordService } from '../services/recordService';
import { createDefaultRecordDraft } from '../utils/recordDrafts';
import { validateRecordDraft } from '../utils/validators';

export function MapPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [origin, setOrigin] = useState('台北市象山步道');
  const [destination, setDestination] = useState('台北市虎山亲山步道');
  const [draft, setDraft] = useState(createDefaultRecordDraft());
  const [draftErrors, setDraftErrors] = useState<Partial<Record<keyof typeof draft, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { isLoaded, loadError, googleMaps } = useGoogleMapsLoader();
  const monitorSummary = useMapMonitorSummary();
  const { mapElementRef, routePlan, routeError, isPlanning, planRoute } = useRoutePlanner(googleMaps);
  const mapBlocked = Boolean(loadError);

  async function handleSaveRecord() {
    const nextErrors = validateRecordDraft(draft);
    setDraftErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length) {
      return;
    }

    if (mapBlocked) {
      setSubmitError(loadError);
      return;
    }

    if (!routePlan || !user) {
      setSubmitError('请先生成路线，再保存这次徒步记录。');
      return;
    }

    setIsSaving(true);

    try {
      const response = await recordService.createRecord(draft, routePlan);
      setDraft(createDefaultRecordDraft());
      startTransition(() => {
        navigate(`/records/${response.data.id}`);
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '保存记录失败');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Stack spacing={4.5}>
      <SectionIntro
        eyebrow="Trail Studio"
        title="先在地图上定路线，再把这次徒步写成一条清晰记录。"
        description="地图页只支持真实 Google Maps 路线规划。只有成功取得真实路线摘要后，系统才允许建立徒步记录。"
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <MetricCard label="Planner" value="Walking" helper="Directions API 步行模式，读取距离与预计时间" />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard label="Save Mode" value="Live Events" helper="保存到真实 backend，并写入 PostgreSQL 资料库" />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard label="Policy" value="Real Maps Only" helper="地图配置或服务异常时，页面不可保存记录" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Stack spacing={2.5}>
            <MapCanvas
              mapElementRef={mapElementRef}
              blockedTitle="地图功能当前不可用"
              blockedDescription={loadError ?? '地图尚未完成载入。'}
              isLoaded={isLoaded}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <MetricCard
                label="起点"
                value={routePlan?.origin.label ?? '等待输入'}
                helper={routePlan?.origin.address ?? '输入地名后可尝试用真实地图解析'}
              />
              <MetricCard
                label="终点"
                value={routePlan?.destination.label ?? '等待输入'}
                helper={routePlan?.destination.address ?? '生成路线后会同步写入记录数据'}
              />
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={5}>
          <MapRoutePanel
            origin={origin}
            destination={destination}
            onOriginChange={setOrigin}
            onDestinationChange={setDestination}
            onPlanRoute={() => planRoute(origin, destination)}
            routePlan={routePlan}
            routeError={routeError}
            loadError={loadError}
            isPlanning={isPlanning}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <RecordEditorForm
            values={draft}
            errors={draftErrors}
            submitLabel="保存为我的徒步记录"
            isSubmitting={isSaving}
            isDisabled={mapBlocked || Boolean(routeError)}
            onChange={(field, value) => setDraft((previous) => ({ ...previous, [field]: value }))}
            onSubmit={handleSaveRecord}
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <Stack spacing={2.5}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <MetricCard
              label="流程"
              value="1. 规划路线"
              helper="输入起点与终点后获取路线摘要，再进入记录表单。"
            />
            <MetricCard
              label="流程"
              value="2. 完成记录"
              helper="写入标题、分类、日期与心得，保存后直接跳转详情页。"
            />
            <Stack
              spacing={1.4}
              sx={{
                p: 3,
                borderRadius: 6,
                border: '1px solid rgba(53, 92, 76, 0.14)',
                bgcolor: 'rgba(255,255,255,0.45)',
              }}
            >
              <Typography variant="h5">当前状态摘要</Typography>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <NearMeRoundedIcon color="secondary" />
                <Typography color="text.secondary">
                  {routePlan ? `已生成 ${routePlan.distanceKm.toFixed(1)} km 路线` : '尚未生成路线'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <BookmarkAddedRoundedIcon color="secondary" />
                <Typography color="text.secondary">
                  记录保存后会写入真实 backend，并同步出现在记录列表页。
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <FmdGoodOutlinedIcon color="secondary" />
                <Typography color="text.secondary">
                  详情页将读取路线摘要、地点信息和地图预览。
                </Typography>
              </Stack>
            </Stack>
            <MapMonitorPanel summary={monitorSummary} />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
