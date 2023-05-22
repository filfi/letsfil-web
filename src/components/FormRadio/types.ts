import classNames from 'classnames';

export type RadioItemProps<V = any> = {
  className?: classNames.Argument;
  icon?: React.ReactNode;
  itemKey?: React.Key;
  desc?: React.ReactNode;
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  value?: V;
  onChange?: () => void;
};

export type RadioButtonProps<V = any> = Omit<RadioItemProps<V>, 'desc'>;

export type RadioItemOption<V = any> = Omit<RadioItemProps<V>, 'checked' | 'itemKey' | 'onClick'>;

export type RadioProps<V = any> = {
  className?: classNames.Argument;
  items?: RadioItemOption[];
  disabled?: boolean;
  children?: React.ReactNode;
  name?: string;
  type?: 'button';
  grid?: boolean;
  checkbox?: boolean;
  value?: V;
  onChange?: (value: V) => void;
};

export type RadioType = React.FC<RadioProps> & {
  Item: React.FC<RadioItemProps>;
};
