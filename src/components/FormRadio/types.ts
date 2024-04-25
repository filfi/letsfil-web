import classNames from 'classnames';

export type ExtraRender = (props: { checked: boolean; disabled: boolean }) => React.ReactNode;

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
  extra?: React.ReactNode | ExtraRender;
  onChange?: () => void;
};

export type RadioButtonProps<V = any> = Omit<RadioItemProps<V>, 'desc' | 'extra'>;

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
  extra?: React.ReactNode | ExtraRender;
  value?: V;
  onChange?: (value: V) => void;
};

export type RadioType = React.FC<RadioProps> & {
  Item: React.FC<RadioItemProps>;
  Button: React.FC<RadioButtonProps>;
};
