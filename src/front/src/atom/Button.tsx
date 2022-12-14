interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={`flex items-center justify-center px-4 py-2 font-pixel text-sm text-white
                  focus:outline-none enabled:hover:ring enabled:hover:ring-slate-100
                  disabled:opacity-50
                  ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
