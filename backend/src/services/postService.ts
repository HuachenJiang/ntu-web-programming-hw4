import type { Prisma } from '@prisma/client';
import { eventRepository } from '../repositories/eventRepository';
import { postRepository } from '../repositories/postRepository';
import { AppError } from '../utils/appError';
import { parseDateOnly } from '../utils/date';
import { normalizePagination } from '../utils/pagination';
import { serializePost } from '../utils/serializers';

interface PostListInput {
  userId: string;
  q?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

interface PostMutationInput {
  title: string;
  description?: string;
  content: string;
  eventId: string;
  completedDate: string;
}

export const postService = {
  async list(input: PostListInput) {
    const where: Prisma.PostWhereInput = {
      ownerId: input.userId,
      ...(input.q
        ? {
            OR: [
              { title: { contains: input.q, mode: 'insensitive' } },
              { description: { contains: input.q, mode: 'insensitive' } },
              { content: { contains: input.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...((input.from || input.to)
        ? {
            completedDate: {
              ...(input.from ? { gte: parseDateOnly(input.from) } : {}),
              ...(input.to ? { lte: parseDateOnly(input.to) } : {}),
            },
          }
        : {}),
    };

    const { page, limit, skip, take } = normalizePagination(input);
    const [posts, total] = await Promise.all([
      postRepository.findMany(where, skip, take),
      postRepository.count(where),
    ]);

    return {
      data: posts.map((post) => serializePost(post)),
      meta: {
        page,
        limit,
        total,
      },
    };
  },

  async getById(id: string, userId: string) {
    const post = await postRepository.findById(id);

    if (!post) {
      throw new AppError(404, '找不到这篇心得');
    }

    if (post.ownerId !== userId) {
      throw new AppError(403, '无权读取其他使用者的心得');
    }

    return serializePost(post);
  },

  async create(input: PostMutationInput, userId: string) {
    const event = await eventRepository.findById(input.eventId);

    if (!event) {
      throw new AppError(404, '找不到关联的徒步记录');
    }

    if (event.ownerId !== userId) {
      throw new AppError(403, '只能针对自己的徒步记录建立心得');
    }

    const post = await postRepository.create({
      ownerId: userId,
      eventId: input.eventId,
      title: input.title,
      description: input.description || undefined,
      content: input.content,
      completedDate: parseDateOnly(input.completedDate),
    });

    return serializePost(post);
  },

  async update(id: string, input: Partial<PostMutationInput>, userId: string) {
    const existingPost = await postRepository.findById(id);

    if (!existingPost) {
      throw new AppError(404, '找不到要更新的心得');
    }

    if (existingPost.ownerId !== userId) {
      throw new AppError(403, '无权修改其他使用者的心得');
    }

    if (input.eventId && input.eventId !== existingPost.eventId) {
      const event = await eventRepository.findById(input.eventId);

      if (!event) {
        throw new AppError(404, '找不到关联的徒步记录');
      }

      if (event.ownerId !== userId) {
        throw new AppError(403, '只能关联自己的徒步记录');
      }
    }

    const post = await postRepository.update(id, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.eventId !== undefined ? { eventId: input.eventId } : {}),
      ...(input.completedDate !== undefined ? { completedDate: parseDateOnly(input.completedDate) } : {}),
    });

    return serializePost(post);
  },

  async remove(id: string, userId: string) {
    const existingPost = await postRepository.findById(id);

    if (!existingPost) {
      throw new AppError(404, '找不到要删除的心得');
    }

    if (existingPost.ownerId !== userId) {
      throw new AppError(403, '无权删除其他使用者的心得');
    }

    const post = await postRepository.delete(id);
    return serializePost(post);
  },
};
