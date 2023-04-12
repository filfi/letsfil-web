import ShareBtn from '@/components/ShareBtn';

const Signer: React.FC<{
  raiseID?: string;
  onCopied?: (url: string) => void;
}> = ({ raiseID, onCopied }) => {
  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">等待服务商签名</h5>
          <p>服务商将核对分配比例和节点信息，无误即可签名核准</p>

          <ShareBtn onSuccess={onCopied} className="btn btn-primary btn-lg w-100" text={`${location.origin}/letsfil/confirm/overview/${raiseID ?? ''}`}>
            分享计划给服务商
          </ShareBtn>
        </div>
      </div>
    </>
  );
};

export default Signer;
