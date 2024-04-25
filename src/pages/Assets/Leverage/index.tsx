import { useModel } from '@umijs/max';
import { useRef, useState } from 'react';

import emitter from '@/utils/mitt';
import LoanCard from './components/LoanCard';
import LoadingView from '@/components/LoadingView';
import useLeversList from '../hooks/useLeversList';
import LoanModal, { type ModalAttrs } from '../components/LoanModal';

export default function AssetsOverview() {
  const modal = useRef<ModalAttrs>(null);

  const [from, setFrom] = useState('');
  const { pack, refetch } = useModel('assets.assets');
  const { data, isError, isLoading, refetch: refetchList } = useLeversList(pack?.raising_id);

  const onRefresh = () => {
    refetch();
    refetchList();

    emitter.emit('onLoanRefresh' as any, from);
  };

  const handleRepay = (id: string) => {
    setFrom(id);

    if (pack?.raising_id) {
      modal.current?.show(id, pack.raising_id);
    }
  };

  return (
    <>
      <LoadingView className="min-vh-30" data={data?.ids} error={isError} loading={isLoading} retry={refetch}>
        {data?.ids.map((id) => (
          <LoanCard key={id} from={id} to={pack?.raising_id} onRepay={() => handleRepay(id)} />
        ))}
      </LoadingView>

      <LoanModal ref={modal} onRefresh={onRefresh} />
    </>
  );
}
