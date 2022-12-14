import React, { useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react-dom-interactions';

import { isDisable2FaModalOpenState } from '@/states/user/twoFaModalStates';
import Button from '@/atom/Button';
import { useDisable2FA } from '@/hooks/mutation/user';

const Disable2FaForm = () => {
  const setIs2FaQrModalOpen = useSetRecoilState(isDisable2FaModalOpenState);
  const [secret, setSecret] = useState('');

  const closeModal = () => {
    setIs2FaQrModalOpen(false);
  };

  const disable2FaMutation = useDisable2FA(closeModal);

  const onChangeSecret = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecret(e.target.value);
  };

  const disable2Fa = () => {
    if (confirm('Are you sure to disable 2FA?')) {
      disable2FaMutation.mutate(secret);
    }
  };

  return (
    <div
      className={`flex h-full w-full flex-col flex-wrap items-center
    justify-between border-4 bg-neutral-900 p-4 font-pixel text-white`}
    >
      <div className={`flex flex-col items-center`}>
        <span className={`mb-2 text-sm`}> Secret </span>
        <input
          className="mb-4 h-10 w-48 bg-white text-true-gray"
          type="text"
          value={secret}
          onChange={onChangeSecret}
        />
      </div>
      <Button onClick={disable2Fa} className={`bg-red-600 text-xs`}>
        Disable 2FA
      </Button>
    </div>
  );
};

const Disable2FaModal = () => {
  const [isModalOpen, setIsModalOpen] = useRecoilState(
    isDisable2FaModalOpenState,
  );
  const { floating, context } = useFloating({
    open: isModalOpen,
    onOpenChange: setIsModalOpen,
  });
  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([dismiss]);

  return (
    <FloatingPortal>
      {isModalOpen && (
        <FloatingOverlay
          lockScroll
          className="flex items-center justify-center bg-neutral-800/80"
        >
          <FloatingFocusManager context={context}>
            <div
              className="h-auto w-auto"
              ref={floating}
              {...getFloatingProps()}
            >
              <Disable2FaForm />
            </div>
          </FloatingFocusManager>
        </FloatingOverlay>
      )}
    </FloatingPortal>
  );
};

export default Disable2FaModal;
