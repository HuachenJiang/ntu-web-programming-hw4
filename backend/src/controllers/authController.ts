import type { Request, Response } from 'express';
import { authService } from '../services/authService';
import { sendSuccess } from '../utils/response';

export const authController = {
  async register(request: Request, response: Response) {
    const result = await authService.register(request.body.name, request.body.email, request.body.password);
    return sendSuccess(response, 201, '注册成功', result);
  },

  async login(request: Request, response: Response) {
    const result = await authService.login(request.body.email, request.body.password);
    return sendSuccess(response, 200, '登录成功', result);
  },

  async logout(_request: Request, response: Response) {
    return sendSuccess(response, 200, '登出成功', null);
  },

  async me(request: Request, response: Response) {
    const user = await authService.getCurrentUser(request.auth!.userId);
    return sendSuccess(response, 200, '当前用户资料读取成功', user);
  },
};
