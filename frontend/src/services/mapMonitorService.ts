export type MapServiceName = 'maps-js' | 'directions' | 'geocoder';

export interface MapMonitorPayload {
  service: MapServiceName;
  status: 'success' | 'error';
  latencyMs?: number;
  errorCode?: string;
  detail?: string;
}

export interface MapMonitorEvent extends MapMonitorPayload {
  timestamp: string;
  userId: string | null;
  dailyCount: number;
  quotaRisk: boolean;
}

export interface MapMonitorServiceSummary {
  service: MapServiceName;
  dailyCount: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  errorRate: number;
  averageLatencyMs: number | null;
  quotaRisk: boolean;
}

export interface MapMonitorSummary {
  date: string;
  totalCount: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  errorRate: number;
  averageLatencyMs: number | null;
  quotaRisk: boolean;
  services: MapMonitorServiceSummary[];
  latestEvent: MapMonitorEvent | null;
}

interface MonitorStore {
  date: string;
  events: MapMonitorEvent[];
}

const STORAGE_KEY = 'hikelog-map-monitor';
const MAX_EVENT_HISTORY = 250;
const QUOTA_ALERT_THRESHOLDS: Record<MapServiceName, number> = {
  'maps-js': 20,
  directions: 40,
  geocoder: 80,
};

const listeners = new Set<() => void>();
let currentUserId: string | null = null;

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getEmptyStore(): MonitorStore {
  return {
    date: getTodayKey(),
    events: [],
  };
}

function getEmptySummary(): MapMonitorSummary {
  return {
    date: getTodayKey(),
    totalCount: 0,
    successCount: 0,
    errorCount: 0,
    successRate: 0,
    errorRate: 0,
    averageLatencyMs: null,
    quotaRisk: false,
    services: [],
    latestEvent: null,
  };
}

function hasWindow() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function toRate(count: number, total: number) {
  if (!total) {
    return 0;
  }

  return Number(((count / total) * 100).toFixed(1));
}

function toAverageLatency(events: MapMonitorEvent[]) {
  const eventsWithLatency = events.filter((event) => typeof event.latencyMs === 'number');

  if (!eventsWithLatency.length) {
    return null;
  }

  const totalLatency = eventsWithLatency.reduce((sum, event) => sum + (event.latencyMs ?? 0), 0);
  return Math.round(totalLatency / eventsWithLatency.length);
}

function notify() {
  listeners.forEach((listener) => listener());
}

function readStore(): MonitorStore {
  if (!hasWindow()) {
    return getEmptyStore();
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return getEmptyStore();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MonitorStore>;

    if (parsed.date !== getTodayKey() || !Array.isArray(parsed.events)) {
      return getEmptyStore();
    }

    return {
      date: parsed.date,
      events: parsed.events as MapMonitorEvent[],
    };
  } catch {
    return getEmptyStore();
  }
}

function writeStore(store: MonitorStore) {
  if (!hasWindow()) {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function buildServiceSummary(service: MapServiceName, events: MapMonitorEvent[]): MapMonitorServiceSummary {
  const serviceEvents = events.filter((event) => event.service === service);
  const successCount = serviceEvents.filter((event) => event.status === 'success').length;
  const errorCount = serviceEvents.length - successCount;

  return {
    service,
    dailyCount: serviceEvents.length,
    successCount,
    errorCount,
    successRate: toRate(successCount, serviceEvents.length),
    errorRate: toRate(errorCount, serviceEvents.length),
    averageLatencyMs: toAverageLatency(serviceEvents),
    quotaRisk: serviceEvents.length >= QUOTA_ALERT_THRESHOLDS[service],
  };
}

function buildSummary(store: MonitorStore): MapMonitorSummary {
  const successCount = store.events.filter((event) => event.status === 'success').length;
  const errorCount = store.events.length - successCount;
  const services = (['maps-js', 'directions', 'geocoder'] as const)
    .map((service) => buildServiceSummary(service, store.events))
    .filter((service) => service.dailyCount > 0);

  return {
    date: store.date,
    totalCount: store.events.length,
    successCount,
    errorCount,
    successRate: toRate(successCount, store.events.length),
    errorRate: toRate(errorCount, store.events.length),
    averageLatencyMs: toAverageLatency(store.events),
    quotaRisk: services.some((service) => service.quotaRisk),
    services,
    latestEvent: store.events.at(-1) ?? null,
  };
}

export const mapMonitorService = {
  setUserContext(userId: string | null) {
    currentUserId = userId;
  },

  record(payload: MapMonitorPayload) {
    const store = readStore();
    const serviceCount = store.events.filter((event) => event.service === payload.service).length + 1;
    const nextEvent: MapMonitorEvent = {
      ...payload,
      timestamp: new Date().toISOString(),
      userId: currentUserId,
      dailyCount: store.events.length + 1,
      quotaRisk: serviceCount >= QUOTA_ALERT_THRESHOLDS[payload.service],
    };

    const nextStore: MonitorStore = {
      date: store.date,
      events: [...store.events, nextEvent].slice(-MAX_EVENT_HISTORY),
    };

    writeStore(nextStore);

    if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
      console.info('[map-monitor]', nextEvent);
    }

    notify();
    return nextEvent;
  },

  getSummary() {
    return buildSummary(readStore());
  },

  subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },

  clear() {
    writeStore(getEmptyStore());
    currentUserId = null;
    notify();
  },
};
