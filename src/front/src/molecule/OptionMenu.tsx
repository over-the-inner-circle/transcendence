export interface Option {
  label: string;
  color?: string;
  onClick(): void;
}

interface OptionMenuProps {
  options: Option[];
  close?(): void;
}

function OptionMenu({ options, close }: OptionMenuProps) {
  return (
    <ul>
      {options.map((option) => (
        <li
          key={option.label}
          className="bg-neutral-900 p-3 font-pixel text-xs text-white"
        >
          <button
            onClick={() => {
              option.onClick();
              if (close) close();
            }}
            className={`h-full w-full ${option.color ?? ''}`}
          >
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default OptionMenu;
