import { Card, CardContent, Stack, Typography } from '@mui/material';

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
}

export function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <Card className="grain-shell">
      <CardContent>
        <Stack spacing={0.8}>
          <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing="0.14em">
            {label}
          </Typography>
          <Typography variant="h4">{value}</Typography>
          <Typography variant="body2" color="text.secondary">
            {helper}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
