export async function number(rule: unknown, value: string) {
  if (value) {
    if (!/^\d+(\.\d+)?$/.test(value)) {
      return Promise.reject('请输入数字');
    }
  }
}

export async function minRaiseRate(rule: unknown, value: string) {
  await number(rule, value);

  if (value && (+value < 10 || +value > 100)) {
    return Promise.reject('最小10%，最大100%');
  }
}
