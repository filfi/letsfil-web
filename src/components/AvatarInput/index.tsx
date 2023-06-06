import { useState } from 'react';
import { Upload, message } from 'antd';
import { useUpdateEffect } from 'ahooks';
import axios, { AxiosError, AxiosHeaders } from 'axios';
import type { UploadProps } from 'antd';
import type { AxiosProgressEvent, AxiosRequestConfig } from 'axios';

import Avatar from '../Avatar';
import { presign } from '@/apis/raise';
import { catchify } from '@/utils/hackify';
import useAccount from '@/hooks/useAccount';

export type AvatarInputProps = {
  size?: number;
  value?: string;
  onChange?: (value: string) => void;
};

function genUid(len = 5) {
  return Math.ceil(Math.random() * Math.pow(10, len));
}

async function upload<F extends File>(file: F, config?: AxiosRequestConfig) {
  const ext = file.name.match(/\.(jpe?g|png)$/i)?.[0];

  if (!ext) return;

  const filename = `${Date.now()}${genUid()}${ext}`;

  const signer = await presign(filename);

  const headers = new AxiosHeaders();
  for (const key of Object.keys(signer.header)) {
    const vals = signer.header[key];

    if (Array.isArray(vals)) {
      for (const val of vals) {
        headers.set(key, val);
      }
    } else {
      headers.set(key, vals);
    }
  }

  const res = await axios.put(signer.uri, file, {
    ...config,
    headers: {
      ...config?.headers,
      ...headers,
    },
  });

  if (res.status >= 200 && res.status <= 300) {
    return signer.access_url;
  }

  throw new AxiosError(res.statusText, `${res.status}`, res.config, res.request, res);
}

function getFileList(val?: string) {
  if (val) {
    return [
      {
        uid: genUid(8),
        name: 'avatar.jpg',
        status: 'done',
        url: val,
      } as any,
    ];
  }
}

const AvatarInput: React.FC<AvatarInputProps> = ({ size, value, onChange }) => {
  const { address } = useAccount();
  const [url, setUrl] = useState(value);

  useUpdateEffect(() => {
    setUrl(value);
  }, [value]);

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (file.size > 2 * 1024 * 1024) {
      message.error('不能超过2M');
      return false;
    }
  };

  const customUpload: UploadProps['customRequest'] = async ({ file, onError, onProgress, onSuccess }) => {
    const onUploadProgress = (e: AxiosProgressEvent) => {
      if (e.total && e.total > 0) {
        // @ts-ignore
        e.percent = (e.loaded / e.total) * 100;
      }

      onProgress?.(e);
    };

    const [e, url] = await catchify(upload)(file as any, { onUploadProgress });

    if (e) {
      message.error(e.message);
      onError?.(e);
      return;
    }

    onSuccess?.(url);
  };

  const handleChange: UploadProps['onChange'] = ({ file }) => {
    if (file.status === 'done') {
      setUrl(file.response);
      onChange?.(file.response);
    }
  };

  return (
    <Upload
      className="avatar-input"
      accept="image/png,image/jpeg"
      listType="picture-circle"
      showUploadList={false}
      defaultFileList={getFileList(value)}
      beforeUpload={beforeUpload}
      customRequest={customUpload}
      onChange={handleChange}
    >
      {url ? <img className="w-100 h-100 d-block rounded-circle object-fit-cover" src={url} /> : <Avatar address={address} size={size} />}
    </Upload>
  );
};

export default AvatarInput;
