import type { Event, Location, Post, User } from '@prisma/client';
import { formatDateOnly } from './date';

export function serializeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function serializeLocation(location: Location) {
  return {
    id: location.id,
    ownerId: location.ownerId,
    name: location.name,
    description: location.description,
    address: location.address,
    latitude: location.latitude,
    longitude: location.longitude,
    category: location.category,
    placeId: location.placeId,
    createdAt: location.createdAt.toISOString(),
    updatedAt: location.updatedAt.toISOString(),
  };
}

export function serializeEvent(event: Event & { location: Location }) {
  return {
    id: event.id,
    ownerId: event.ownerId,
    title: event.title,
    description: event.description ?? '',
    category: event.category,
    status: event.status,
    completedDate: formatDateOnly(event.completedDate),
    distanceKm: event.distanceKm,
    durationMinutes: event.durationMinutes,
    notes: event.notes,
    routePlan: event.routePlanJson,
    location: serializeLocation(event.location),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

export function serializePost(post: Post) {
  return {
    id: post.id,
    ownerId: post.ownerId,
    eventId: post.eventId,
    title: post.title,
    description: post.description ?? '',
    content: post.content,
    completedDate: formatDateOnly(post.completedDate),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}
