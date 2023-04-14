import SpinBtn from '@/components/SpinBtn';

const Deposit: React.FC<{
  loading?: boolean;
  payforing?: boolean;
  onPayfor?: () => void;
  onConfirm?: () => void;
}> = ({ loading, payforing, onPayfor, onConfirm }) => {
  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">未缴纳运维保证金</h5>
          <p>运维保证金根据节点大小与节点封装延期产生的罚金来计算，节点到期时返还；选择自己支付则自己获取收益，他人支付则他人获取收益</p>

          <div className="row row-cols-1 row-cols-xl-2 g-3">
            <div className="col">
              <SpinBtn className="btn btn-light btn-lg w-100" loading={loading} disabled={payforing} onClick={onConfirm}>
                {loading ? '正在支付' : '自己支付'}
              </SpinBtn>
            </div>
            <div className="col">
              <SpinBtn className="btn btn-primary btn-lg w-100" loading={payforing} disabled={loading} onClick={onPayfor}>
                {payforing ? '正在处理' : '他人代付'}
              </SpinBtn>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Deposit;
