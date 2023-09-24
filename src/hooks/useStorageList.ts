import { normalizeKey } from '@/utils/storage';
import { useSessionStorageState } from 'ahooks';

function dispatch<T>(action: (list: T[]) => any) {
  return (list: T[] | undefined = []) => {
    const _list = list?.slice();

    action(_list);

    return _list;
  };
}

export default function useStorageList<T>(key: string, initialList: T[] = []) {
  const [list, setList] = useSessionStorageState<T[]>(normalizeKey(key), { defaultValue: initialList });

  const clear = () => setList(undefined as any);

  const reset = (items: T[]) => setList(items);

  const pop = () => setList(dispatch((list) => list.pop()));

  const push = (item: T) => setList(dispatch((list) => list.push(item)));

  const remove = (index: number) => setList(dispatch((list) => list.splice(index, 1)));

  const replace = (index: number, item: T) => setList(dispatch((list) => list.splice(index, 1, item)));

  const insert = (index: number, ...items: T[]) => setList(dispatch((list) => list.splice(index, 0, ...items)));

  return {
    list,
    pop,
    push,
    clear,
    reset,
    insert,
    remove,
    replace,
  };
}
