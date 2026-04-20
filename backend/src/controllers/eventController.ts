import type { Request, Response } from 'express';
import { eventService } from '../services/eventService';
import { sendSuccess } from '../utils/response';

export const eventController = {
  async list(request: Request, response: Response) {
    const result = await eventService.list({
      userId: request.auth!.userId,
      ...request.query,
    } as never);

    return sendSuccess(response, 200, '徒步记录列表读取成功', result.data, result.meta);
  },

  async getById(request: Request, response: Response) {
    const { id } = request.params as { id: string };
    const event = await eventService.getById(id, request.auth!.userId);
    return sendSuccess(response, 200, '徒步记录读取成功', event);
  },

  async create(request: Request, response: Response) {
    const event = await eventService.create(request.body, request.auth!.userId);
    return sendSuccess(response, 201, '徒步记录建立成功', event);
  },

  async update(request: Request, response: Response) {
    const { id } = request.params as { id: string };
    const event = await eventService.update(id, request.body, request.auth!.userId);
    return sendSuccess(response, 200, '徒步记录更新成功', event);
  },

  async remove(request: Request, response: Response) {
    const { id } = request.params as { id: string };
    const event = await eventService.remove(id, request.auth!.userId);
    return sendSuccess(response, 200, '徒步记录删除成功', event);
  },
};
