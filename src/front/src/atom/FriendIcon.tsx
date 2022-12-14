interface FriendIconProps {
  width?: number;
  height?: number;
  isActive?: boolean;
}

export default function FriendIcon({
  width = 40,
  height = 40,
  isActive = false,
}: FriendIconProps) {
  return (
    <div className="p-2 hover:bg-neutral-700">
      {isActive ? (
        <FriendIconActive width={width} height={height} />
      ) : (
        <FriendIconInactive width={width} height={height} />
      )}
    </div>
  );
}

function FriendIconInactive(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 49 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M26.938 1.878v1.45H39.5v2.988h3.094v11.69H39.5v2.988H36.313v2.9h6.28v2.9h3.188v5.89h-10.5l.019 1.476.028 1.468 6.778.026 6.769.018V26.795h-3.094v-2.9H42.594V18.006H45.78V6.316H42.594V3.328H39.5v-2.9H26.937v1.45Z"
        fill="#fff"
      />
      <path
        d="M10.25 4.822v1.494H7.156v2.9H3.97l.018 5.863.029 5.871 1.575.027 1.565.017v5.8h6.282v-2.9H10.25v-2.9H7.156V9.217h3.094v-2.9H22.813v2.9h3.093V20.995h-3.094v2.9H19.625v2.9H25.906v-5.8l1.575-.018 1.566-.027V9.261l-1.566-.027-1.575-.017v-2.9h-3.094l-.018-1.477-.028-1.468-6.253-.026-6.263-.018v1.494ZM4.034 26.848c-.037.035-.065.712-.065 1.503v1.432H.875v8.789H32.188v-8.789h-3.094l-.019 2.918-.028 2.927H4.016L3.987 32.7l-.018-2.918H7.156l-.018-1.476-.029-1.468-1.509-.026c-.825-.01-1.528.008-1.566.035Z"
        fill="#fff"
      />
      <path
        d="M25.972 26.848c-.038.035-.066.712-.066 1.503v1.432l1.575-.017 1.566-.027v-2.9l-1.51-.026c-.825-.01-1.528.008-1.565.035Z"
        fill="#fff"
      />
    </svg>
  );
}

function FriendIconActive(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 44 37"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M23.723 1.661v1.386l1.41.017 1.403.025.025 1.402.017 1.411h2.772V25.471h1.847l.017 4.224.025 4.216 6.072.025 6.064.017v-8.482h-2.772v-2.772h-5.626v-2.771h2.771v-2.856h2.855V5.902h-2.855V3.047h-2.771V.275H23.723v1.386Z"
        fill="#fff"
      />
      <path
        d="M8.773 4.475v1.427H6.002v2.772H3.146l.017 5.602.025 5.61 1.411.025 1.403.017v2.771h2.771v2.772l-2.788.017-2.797.025-.025 1.402-.017 1.411H.375V36.725H28.426V28.326h-2.772l-.017-1.402-.025-1.411-2.788-.026-2.797-.016v-2.772H22.8v-2.771l1.41-.017 1.403-.025V8.716L24.21 8.69l-1.411-.017V5.902h-2.772l-.017-1.41-.025-1.403-5.601-.025-5.61-.017v1.428Z"
        fill="#fff"
      />
    </svg>
  );
}
