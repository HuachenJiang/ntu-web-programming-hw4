import type { Request, Response } from 'express';
import { postService } from '../services/postService';
import { sendSuccess } from '../utils/response';

export const postController = {
  async list(request: Request, response: Response) {
    const result = await postService.list({
      userId: request.auth!.userId,
      ...request.query,
    } as never);

    return sendSuccess(response, 200, '心得列表读取成功', result.data, result.meta);
  },

  async getById(request: Request, response: Response) {
    const { id } = request.params as { id: string };
    const post = await postService.getById(id, request.auth!.userId);
    return sendSuccess(response, 200, '心得读取成功', post);
  },

  async create(request: Request, response: Response) {
    const post = await postService.create(request.body, request.auth!.userId);
    return sendSuccess(response, 201, '心得建立成功', post);
  },

  async update(request: Request, response: Response) {
    const { id } = request.params as { id: string };
    const post = await postService.update(id, request.body, request.auth!.userId);
    return sendSuccess(response, 200, '心得更新成功', post);
  },

  async remove(request: Request, response: Response) {
    const { id } = request.params as { id: string };
    const post = await postService.remove(id, request.auth!.userId);
    return sendSuccess(response, 200, '心得删除成功', post);
  },
};
