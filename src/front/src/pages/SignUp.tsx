import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/atom/Button';
import { useSignUpUser } from '@/hooks/mutation/user';
import { isValidNickname } from '@/hooks/user';

const SignUp = () => {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();
  const signUp = useSignUpUser();

  const signUpNewUser = async () => {
    if (isValidNickname(nickname)) {
      signUp.mutate(nickname);
    }
  };

  const cancelSignUp = () => {
    // TODO : 회원가입 취소
    navigate('/');
  };

  const onChangeUsernameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  return (
    <div className="z-0 flex h-full w-full flex-col items-center justify-center bg-neutral-900 font-pixel text-white">
      <div className="mb-16 flex flex-row gap-20">
        <div className="flex flex-col">
          <div className="stop-dragging mb-2"> Username </div>
          <input
            className="h-10 w-48 bg-white text-true-gray"
            type="text"
            value={nickname}
            onChange={onChangeUsernameInput}
          />
        </div>
      </div>
      <div className="stop-dragging flex flex-row gap-20">
        <Button
          className={'bg-true-gray-600 py-3 px-5 text-xs hover:bg-neutral-400'}
          onClick={cancelSignUp}
        >
          Cancel
        </Button>
        <Button
          className={'bg-true-green-600 py-3 px-5 text-xs hover:bg-green-400'}
          onClick={signUpNewUser}
        >
          Sign Up
        </Button>
      </div>
    </div>
  );
};

export default SignUp;
