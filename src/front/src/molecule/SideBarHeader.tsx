interface SideBarHeaderProps {
  children: React.ReactNode;
}

function SideBarHeader({ children }: SideBarHeaderProps) {
  return (
    <div
      className="flex h-12 w-full shrink-0 flex-row items-center justify-between
                       border-b border-neutral-400 bg-neutral-800 px-5 py-6"
    >
      {children}
    </div>
  );
}

export default SideBarHeader;
