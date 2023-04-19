import { useEventListener } from 'ahooks';

export default function useInputScrollAction() {
  const onMouseWheel = (e: WheelEvent) => {
    const target = e.target as HTMLInputElement;

    if (target.tagName === 'INPUT' && target.type === 'number') {
      target.blur();
    }
  };

  useEventListener('wheel', onMouseWheel);
}
