import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1, '请输入昵称').max(50),
  email: z.string().trim().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少需要 6 个字符'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少需要 6 个字符'),
});
