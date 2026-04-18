import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { Box, Stack, Typography } from '@mui/material';
import type { MutableRefObject } from 'react';

interface MapCanvasProps {
  mapElementRef: MutableRefObject<HTMLDivElement | null>;
  blockedTitle: string;
  blockedDescription: string;
  isLoaded: boolean;
}

export function MapCanvas({
  mapElementRef,
  blockedTitle,
  blockedDescription,
  isLoaded,
}: MapCanvasProps) {
  return isLoaded ? (
    <Box ref={mapElementRef} className="map-surface" />
  ) : (
    <Box className="map-blocked">
      <Stack spacing={1.2} alignItems="center" textAlign="center" maxWidth={360}>
        <PlaceOutlinedIcon sx={{ fontSize: 44 }} />
        <Typography variant="h5">{blockedTitle}</Typography>
        <Typography color="text.secondary">{blockedDescription}</Typography>
      </Stack>
    </Box>
  );
}
