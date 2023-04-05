export function number(rule: any, value: string) {
  if (value) {
    if (!/^\d+(\.\d+)?$/.test(value)) {
      return Promise.reject('请输入数字');
    }
  }

  return Promise.resolve();
}
