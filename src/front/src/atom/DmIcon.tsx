interface DmIconProps {
  width?: number;
  height?: number;
  isActive?: boolean;
}

export default function DmIcon({
  width = 40,
  height = 34,
  isActive = false,
}: DmIconProps) {
  return (
    <div className="p-2 hover:bg-neutral-700">
      {isActive ? (
        <DmIconActive width={width} height={height} />
      ) : (
        <DmIconInactive width={width} height={height} />
      )}
    </div>
  );
}

function DmIconInactive(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 44 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M.625 3.76v3.259h2.82l.017 1.624.026 1.635h2.82l.025-1.635.017-1.624H3.445V3.808h38.11V7.019H38.65l.017 1.624.026 1.635h2.82l.025-1.635.017-1.624h2.82V.5H.625v3.26Z"
        fill="#fff"
      />
      <path
        d="M6.35 12.062v1.873h2.82v3.746H12.075V40.5h6.58v-3.86H21.56v-3.746h2.82v-3.86H27.285v-3.747h2.82v-3.746h2.82v-3.86H35.83v-3.746h2.82v-3.747h-2.82v3.747H32.925v3.746h-2.82v3.86h-2.82v3.746H24.38v3.747h-2.82v3.86H18.655v3.746h-3.76V21.541h3.76v-3.86h5.725v-3.746h5.725v-3.747H24.38v3.747h-5.725v3.746h-6.58v-3.746H9.17v-3.747H6.35v1.874Z"
        fill="#fff"
      />
    </svg>
  );
}

function DmIconActive(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 44 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M.125 4.141v3.642h2.82l.017 1.815.026 1.826 1.435.033 1.427.021V15.065h2.82V18.652h9.485v3.696h-6.58V40.5h6.58l.017-1.826.026-1.815 1.435-.033 1.427-.022V33.217h2.82l.017-1.815.026-1.826 1.435-.032 1.427-.022V25.935h2.82V22.348h2.82l.017-1.826.026-1.816 1.435-.032 1.427-.022V15.065h2.82V11.478l1.435-.021 1.428-.033.025-1.826.017-1.815h2.82V.5H.125v3.641Zm29.48 9.13v1.794H23.88V18.652h-5.725V15.065h5.725V11.478h5.725v1.794Z"
        fill="#fff"
      />
    </svg>
  );
}
