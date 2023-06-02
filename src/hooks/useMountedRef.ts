import { useRef } from 'react';
import { useMount, useUnmount } from 'ahooks';

export default function useMountedRef() {
  const ref = useRef(false);

  useMount(() => {
    ref.current = true;
  });

  useUnmount(() => {
    ref.current = false;
  });

  return ref;
}
