import Circle from '@/atom/Circle';

interface StatusIndicatorProps {
  status?: string;
  radius?: number;
}
function StatusIndicator({ status, radius = 9.5 }: StatusIndicatorProps) {
  return (
    <Circle
      radius={radius}
      className={
        status === 'online'
          ? 'fill-green-500'
          : status === 'ingame'
          ? 'fill-amber-500'
          : 'fill-neutral-500'
      }
    />
  );
}

export default StatusIndicator;
