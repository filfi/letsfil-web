import { Avatar as AntAvatar } from 'antd';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import type { AvatarProps as AntAvatarProps } from 'antd';

import useAccount from '@/hooks/useAccount';

export type AvatarProps = AntAvatarProps & {
  address?: string;
};

const isStr = (v: unknown): v is string => typeof v === 'string';
const isUrl = (v: unknown): v is string => isStr(v) && /^http/.test(v);

const Avatar: React.FC<AvatarProps> = ({ className, address, size, src, ...props }) => {
  const { address: account } = useAccount();

  const renderSrc = () => {
    if (isUrl(src)) {
      return <img className="d-block w-100 h-100 object-fit-cover" src={src} />;
    }

    return (
      <Jazzicon
        diameter={48}
        seed={jsNumberForAddress(address ?? account ?? '0x111111111111111111111111111111111111111111111')}
        svgStyles={{ width: '100%', height: '100%' }}
        paperStyles={{ display: 'inline-block', width: '100%', height: '100%', fontSize: 0 }}
      />
    );
  };

  return <AntAvatar className={className} size={size} {...props} src={renderSrc()} />;
};

export default Avatar;
