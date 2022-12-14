export interface SideBarLayoutProps {
  children: React.ReactNode;
}

function SideBarLayout({ children }: SideBarLayoutProps) {
  return (
    <div
      className="flex h-full w-[370px] shrink-0 flex-col items-start justify-start
                 overflow-y-auto border-l border-neutral-400 bg-neutral-600 font-pixel text-white"
    >
      {children}
    </div>
  );
}

export default SideBarLayout;
