import { Slider } from 'antd';
import { useUpdateEffect } from 'ahooks';
import { useRef, useState } from 'react';
import type { SliderSingleProps } from 'antd/es/slider';

import styles from './styles.less';

export type FFISliderProps = Omit<SliderSingleProps, 'tooltip'> & {
  onValueChange?: (value: number) => void;
  renderLabel?: (value: number) => React.ReactNode;
};

const FFISlider: React.FC<FFISliderProps> = ({
  defaultValue,
  value,
  renderLabel,
  onChange,
  onValueChange,
  ...props
}) => {
  const root = useRef<HTMLDivElement>(null);

  const [curr, setValue] = useState(defaultValue ?? value ?? 0);

  const _renderLabel = (val: number) => {
    if (renderLabel) {
      return renderLabel(val);
    }

    return `${val}%`;
  };

  const handleChange = (value: number) => {
    setValue(value);
    onChange?.(value);
    onValueChange?.(value);
  };

  useUpdateEffect(() => {
    setValue((v) => (v !== value ? value : v) ?? v);
  }, [value]);

  return (
    <div ref={root} className={styles.ffiSlider}>
      <Slider {...props} value={value} tooltip={{ open: false }} onChange={handleChange} />

      <span className={styles.ffiSliderLabel} style={{ left: `${curr}%` }}>
        {_renderLabel(curr)}
      </span>
    </div>
  );
};

export default FFISlider;
