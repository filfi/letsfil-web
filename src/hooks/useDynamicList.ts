import { useState } from 'react';

export type DynamicItem<T> = {
  key: React.Key;
} & T;

function genKey() {
  return Math.round(Math.random() * 1000000).toString(16);
}

function normalizeItem<T extends { key?: React.Key }>(item: T) {
  return {
    ...item,
    key: item.key ?? genKey(),
  };
}

function normalizeList<T extends { key?: React.Key }>(list: T[]) {
  return list.map(normalizeItem);
}

function dispatch<T>(action: (list: T[]) => any) {
  return (list: T[] | undefined = []) => {
    const _list = list?.slice();

    action(_list);

    return _list;
  };
}

export default function useDynamicList<T extends { key?: React.Key }>(initialList: T[] = []) {
  const [list, setList] = useState<DynamicItem<T>[]>(normalizeList(initialList));

  const clear = () => setList(undefined as any);

  const reset = (items: T[]) => setList(normalizeList(items));

  const pop = () => setList(dispatch((list) => list.pop()));

  const push = (item: T) => setList(dispatch((list) => list.push(normalizeItem(item))));

  const remove = (index: number) => setList(dispatch((list) => list.splice(index, 1)));

  const replace = (index: number, item: T) => setList(dispatch((list) => list.splice(index, 1, normalizeItem(item))));

  const insert = (index: number, ...items: T[]) => setList(dispatch((list) => list.splice(index, 0, ...normalizeList(items))));

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
