interface ChatIconProps {
  width?: number;
  height?: number;
  isActive?: boolean;
}

export default function ChatIcon({
  width = 40,
  height = 40,
  isActive = false,
}: ChatIconProps) {
  return (
    <div className="p-2 hover:bg-neutral-700">
      {isActive ? (
        <ChatIconActive width={width} height={height} />
      ) : (
        <ChatIconInactive width={width} height={height} />
      )}
    </div>
  );
}

function ChatIconInactive(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 44 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9.273 1.386V2.77H6.502v2.856H3.646v2.771H.875v12.178h2.771v2.772h2.856v2.855h2.771V31.746h2.856v2.856H14.9v2.771h2.772V43H29.85v-2.772l2.796-.016 2.789-.026.025-1.41.017-1.403h2.771v-2.771l1.411-.017 1.403-.025v-2.772H38.29l-.025 1.403-.017 1.41h-2.771v2.772H29.85v2.855h-9.322v-2.855h2.771v-2.771H14.9v-2.856H12.13V19.652H14.9v-2.855h2.772v-2.772h17.805v2.772h2.771v2.855h2.855v12.094h2.772V19.652h-2.772l-.016-1.41-.026-1.403-1.402-.025-1.411-.017v-2.772h-2.771V8.398H32.62V5.627H29.85V2.771h-2.772V0H9.273v1.386Zm17.805 2.813v1.428h2.772v2.771h2.771v2.856H17.672v2.771H14.9v2.772H12.13v2.855H9.273v3.696H6.502v-2.772H3.646V8.398h2.856V5.627h2.771V2.771h17.805V4.2Z"
        fill="#fff"
      />
      <path
        d="M17.672 21.962v1.386h17.805v-2.772H17.672v1.386ZM17.672 27.589v1.386H29.85v-2.772H17.672v1.386Z"
        fill="#fff"
      />
    </svg>
  );
}

function ChatIconActive(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 44 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9.273 1.386V2.77H6.502v2.856H3.646v2.771H.875v12.178h2.771v2.772h2.856v2.855h2.771V31.746l1.411.017 1.403.025.025 1.403.017 1.41H14.9v2.772H20.527l-.017 1.403-.025 1.41-1.402.026-1.411.016V43H29.85v-2.772l2.796-.016 2.789-.026.025-1.41.017-1.403h2.771v-2.771l1.411-.017 1.403-.025.025-1.411.016-1.403h2.772V19.652h-2.772l-.016-1.41-.026-1.403-1.402-.025-1.411-.017v-2.772h-2.771V8.398H32.62V5.627H29.85V2.771h-2.772V0H9.273v1.386Zm17.805 2.813v1.428h2.772v2.771h2.771v2.856H17.672v2.771H14.9v2.772H12.13l-.017 1.402-.025 1.411-1.403.026-1.41.016v3.696H6.501v-2.772H3.646V8.398h2.856V5.627h2.771V2.771h17.805V4.2Zm8.399 17.763v1.386H17.672v-2.772h17.805v1.386Zm-5.627 5.627v1.386H17.672v-2.772H29.85v1.386Z"
        fill="#fff"
      />
    </svg>
  );
}
