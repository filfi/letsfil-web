import { useMemo } from 'react';

import ShareBtn from '@/components/ShareBtn';

const Signer: React.FC<{
  data?: API.Plan;
}> = ({ data }) => {
  const raiseId = useMemo(() => data?.raising_id ?? '', [data]);
  const link = useMemo(() => `${location.origin}/letsfil/confirm/overview/${raiseId}`, []);

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">等待服务商签名</h5>
          <p>服务商将核对分配比例和节点信息，无误即可签名核准</p>

          <ShareBtn className="btn btn-primary btn-lg w-100" text={link}>
            分享计划给服务商
          </ShareBtn>
        </div>
      </div>
    </>
  );
};

export default Signer;
