import { useResponsive } from 'ahooks';
import { Avatar as AntAvatar } from 'antd';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import type { AvatarProps as AntAvatarProps } from 'antd';

import useAccount from '@/hooks/useAccount';

export type AvatarProps = AntAvatarProps & {
  address?: string;
};

const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number';
const isUrl = (v: unknown): v is string => isStr(v) && /^http/.test(v);

const Avatar: React.FC<AvatarProps> = ({ className, address, size, src, ...props }) => {
  const { account } = useAccount();
  const responsive = useResponsive();

  if (isUrl(src)) {
    return <AntAvatar className={className} size={size} src={src} {...props} />;
  }

  const getSize = (size: AvatarProps['size']) => {
    if (size === 'default') return 32;
    if (size === 'large') return 40;
    if (size === 'small') return 24;

    if (isNum(size)) return size;

    if (responsive.xxl && size?.xxl) return size.xxl;
    if (responsive.xl && size?.xl) return size.xl;
    if (responsive.lg && size?.lg) return size.lg;
    if (responsive.md && size?.md) return size.md;
    if (responsive.sm && size?.sm) return size.sm;

    return size?.xs ?? 32;
  };

  return (
    <div className={className}>
      <Jazzicon
        diameter={getSize(size)}
        seed={jsNumberForAddress(address ?? account)}
        paperStyles={{ display: 'block' }}
        svgStyles={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default Avatar;
