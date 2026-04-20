import type { Request, Response } from 'express';
import { locationService } from '../services/locationService';
import { sendSuccess } from '../utils/response';

export const locationController = {
  async list(request: Request, response: Response) {
    const result = await locationService.list({
      userId: request.auth!.userId,
      ...request.query,
    } as never);

    return sendSuccess(response, 200, '地点列表读取成功', result.data, result.meta);
  },

  async getById(request: Request, response: Response) {
    const { id } = request.params as { id: string };
    const location = await locationService.getById(id, request.auth!.userId);
    return sendSuccess(response, 200, '地点资料读取成功', location);
  },

  async create(request: Request, response: Response) {
    const location = await locationService.create(request.body, request.auth!.userId);
    return sendSuccess(response, 201, '地点资料建立成功', location);
  },

  async update(request: Request, response: Response) {
    const { id } = request.params as { id: string };
    const location = await locationService.update(id, request.body, request.auth!.userId);
    return sendSuccess(response, 200, '地点资料更新成功', location);
  },

  async remove(request: Request, response: Response) {
    const { id } = request.params as { id: string };
    const location = await locationService.remove(id, request.auth!.userId);
    return sendSuccess(response, 200, '地点资料删除成功', location);
  },
};
