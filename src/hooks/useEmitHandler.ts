import { useMount, useUnmount } from 'ahooks';
import type { Handler } from 'mitt';

import emitter from '@/utils/mitt';
import type { EventType, Events } from '@/utils/mitt';

export default function useEmittHandler<Key extends EventType>(
  handlers: Record<Key, Handler<Events[Key]>>,
) {
  useMount(() => {
    for (const event of Object.keys(handlers)) {
      emitter.on(event as Key, handlers[event as Key]);
    }
  });

  useUnmount(() => {
    for (const event of Object.keys(handlers)) {
      emitter.off(event as Key, handlers[event as Key]);
    }
  });
}
