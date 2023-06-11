import { Avatar as AntAvatar } from 'antd';
import SizeContext from 'antd/es/avatar/SizeContext';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { responsiveArray } from 'antd/es/_util/responsiveObserver';
import type { AvatarProps as AntAvatarProps } from 'antd';

import useAccount from '@/hooks/useAccount';
import { useContext, useMemo } from 'react';

export type AvatarProps = AntAvatarProps & {
  address?: string;
};

const isNum = (v: unknown): v is number => typeof v === 'number';
const isStr = (v: unknown): v is string => typeof v === 'string';
const isUrl = (v: unknown): v is string => isStr(v) && /^http/.test(v);

const Avatar: React.FC<AvatarProps> = ({ className, address, size, src, ...props }) => {
  const { address: account } = useAccount();
  const contextSize = useContext(SizeContext);
  const customSize = size === 'default' ? contextSize : size;

  const needResponsive = Object.keys(typeof size === 'object' ? size || {} : {}).some((key) => ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(key));
  const screens = useBreakpoint(needResponsive);

  const diameter = useMemo(() => {
    if (isNum(customSize)) return customSize;

    if (typeof customSize === 'object') {
      const currentBreakpoint = responsiveArray.find((screen) => screens[screen])!;
      return customSize[currentBreakpoint];
    }

    return size === 'large' ? 40 : size === 'small' ? 24 : 30;
  }, [screens, customSize]);

  const renderSrc = () => {
    if (isUrl(src)) {
      return <img className="d-block w-100 h-100 object-fit-cover" src={src} />;
    }

    return (
      <Jazzicon
        diameter={diameter}
        svgStyles={{ display: 'block' }}
        paperStyles={{ display: 'inline-block', width: '100%', height: '100%', fontSize: 0 }}
        seed={jsNumberForAddress(address ?? account ?? '0x111111111111111111111111111111111111111111111')}
      />
    );
  };

  return <AntAvatar className={className} size={size} {...props} src={renderSrc()} />;
};

export default Avatar;
