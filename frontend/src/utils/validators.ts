import type { AuthCredentials, RegisterPayload } from '../types/auth';
import type { RecordDraft } from '../types/models';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(values: AuthCredentials) {
  const errors: Partial<Record<keyof AuthCredentials, string>> = {};

  if (!values.email.trim()) {
    errors.email = '请输入邮箱';
  } else if (!emailRegex.test(values.email)) {
    errors.email = '邮箱格式不正确';
  }

  if (!values.password.trim()) {
    errors.password = '请输入密码';
  } else if (values.password.length < 6) {
    errors.password = '密码至少需要 6 个字符';
  }

  return errors;
}

export function validateRegister(values: RegisterPayload) {
  const errors: Partial<Record<keyof RegisterPayload, string>> = {
    ...validateLogin(values),
  };

  if (!values.name.trim()) {
    errors.name = '请输入昵称';
  }

  return errors;
}

export function validateRecordDraft(values: RecordDraft) {
  const errors: Partial<Record<keyof RecordDraft, string>> = {};

  if (!values.title.trim()) {
    errors.title = '请输入路线标题';
  }

  if (!values.completedDate) {
    errors.completedDate = '请选择完成日期';
  }

  if (!values.notes.trim()) {
    errors.notes = '请补充这次徒步的心得';
  }

  return errors;
}
