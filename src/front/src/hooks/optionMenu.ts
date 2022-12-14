import {
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react-dom-interactions';
import { useState } from 'react';

export function useOptionMenu() {
  const [open, setOpen] = useState(false);

  const data = useFloating({
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [offset(3), flip(), shift({ padding: 3 })],
  });

  const context = data.context;

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });
  const interactions = useInteractions([click, dismiss, role]);

  return {
    open,
    setOpen,
    ...data,
    ...interactions,
  };
}
