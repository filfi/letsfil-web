import dayjs from 'dayjs';
import { useUpdateEffect } from 'ahooks';
import { useMemo, useState } from 'react';
import { DatePicker, Input, TimePicker } from 'antd';

import { ReactComponent as IconDate } from '@/assets/icons/calendar-date.svg';

export type DisabledTimes = {
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
};

export type DateTimePickerProps = {
  value?: dayjs.Dayjs;
  disabled?: boolean;
  dateFormat?: string;
  timeFormat?: string;
  placeholder?: string;
  disabledDate?: (date: any) => boolean;
  disabledTime?: (time: dayjs.Dayjs) => DisabledTimes;
  onChange?: (value: dayjs.Dayjs) => void;
};

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  disabled,
  dateFormat = 'YYYY-MM-DD',
  timeFormat = 'HH:mm',
  placeholder,
  disabledDate,
  disabledTime,
  onChange,
}) => {
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [date, setDate] = useState<dayjs.Dayjs | null | undefined>();
  const [time, setTime] = useState<dayjs.Dayjs | null | undefined>();
  // const [dateTime, setDateTime] = useState<dayjs.Dayjs | null | undefined>(resolveDateTime(value));

  const timeVal = useMemo(() => {
    if (value) {
      return dayjs(value).format([dateFormat, timeFormat].join(' '));
    }

    return '';
  }, [value, dateFormat, timeFormat]);

  useUpdateEffect(() => {
    if (value) {
      setDate(dayjs(value));
      setTime(dayjs(value));
    }
  }, [value]);

  useUpdateEffect(() => {
    if (date && time) {
      const d = dayjs(date).format(dateFormat);
      const t = dayjs(time).format(timeFormat);

      const val = [d, t].join(' ');
      const day = dayjs(val, [dateFormat, timeFormat].join(' '));

      onChange?.(day);
    }
  }, [date, time]);

  const handleDateChange = (val: dayjs.Dayjs | null) => {
    setDate(val);

    if (!time) {
      setTimeOpen(true);
    }
  };

  const handleTimeChange = (val: dayjs.Dayjs | null) => {
    setTime(val);
  };

  return (
    <div className="position-relative">
      <DatePicker
        className="position-absolute opacity-0"
        value={date}
        open={dateOpen}
        format={dateFormat}
        disabled={disabled}
        disabledDate={disabledDate}
        onChange={handleDateChange}
        onOpenChange={(val) => setDateOpen(val)}
      />
      <TimePicker
        className="position-absolute opacity-0"
        value={time}
        open={timeOpen}
        format={timeFormat}
        disabled={disabled}
        disabledTime={disabledTime}
        onChange={handleTimeChange}
        onOpenChange={(val) => setTimeOpen(val)}
      />
      <Input
        value={timeVal}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={() => setDateOpen(true)}
        addonAfter={
          <a className="text-reset" onClick={() => setDateOpen(true)}>
            <IconDate />
          </a>
        }
      />
    </div>
  );
};

export default DateTimePicker;
