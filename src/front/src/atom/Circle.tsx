interface CircleProps {
  radius: number;
  className?: string;
}

function Circle({ radius, className }: CircleProps) {
  return (
    <svg height={radius * 2} width={radius * 2} className={className}>
      <circle cx={radius} cy={radius} r={radius} />
    </svg>
  );
}

export default Circle;
