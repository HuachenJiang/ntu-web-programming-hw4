import { useEffect, useState } from 'react';
import { mapMonitorService } from '../services/mapMonitorService';

export function useMapMonitorSummary() {
  const [summary, setSummary] = useState(() => mapMonitorService.getSummary());

  useEffect(() => {
    setSummary(mapMonitorService.getSummary());

    return mapMonitorService.subscribe(() => {
      setSummary(mapMonitorService.getSummary());
    });
  }, []);

  return summary;
}
