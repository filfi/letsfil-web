import { useCountDown } from 'ahooks';

const Countdown: React.FC<{ time: number }> = ({ time }) => {
  const [, formatted] = useCountDown({ targetDate: time * 1000 });

  return (
    <>
      {formatted.days > 0 && <span>{formatted.days}天</span>}
      {(formatted.days > 0 || formatted.hours > 0) && <span>{formatted.hours}小时</span>}
      {(formatted.days > 0 || formatted.hours > 0 || formatted.minutes > 0) && <span>{formatted.minutes}分</span>}
      <span>{formatted.seconds}秒</span>
    </>
  );
};

export default Countdown;
