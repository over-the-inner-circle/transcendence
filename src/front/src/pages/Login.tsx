import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { useMutation } from '@tanstack/react-query';
import { BASE_API_URL, useFetcher } from '@/hooks/fetcher';
import { SignUpUserInfo, signUpUserInfoState } from '@/states/user/signUp';
import { toast } from 'react-toastify';
import { accessTokenState } from '@/states/user/auth';
import Button from '@/atom/Button';

interface LoginParams {
  provider: string;
  code: string;
}

function useLoginMutation(
  setError: (error: string) => void,
  setIs2FaRequired: (is2FaRequired: boolean) => void,
  tempAccessTokenRef: React.MutableRefObject<string>,
) {
  const navigate = useNavigate();
  const setSignupUserInfo = useSetRecoilState(signUpUserInfoState);
  const setAccessToken = useSetRecoilState(accessTokenState);
  const fetcher = useFetcher();

  const mutation = useMutation({
    mutationFn: async ({ code, provider }: LoginParams) => {
      const res = await fetcher(`/auth/oauth2/${provider}`, {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        throw res;
      }
      return res.json();
    },
    onSuccess: (data) => {
      if ('access_token' in data) {
        if (!data.grant) {
          setIs2FaRequired(true);
          tempAccessTokenRef.current = data.access_token;
          return;
        }
        setAccessToken(data.access_token);
        window.localStorage.setItem('refresh_token', data.refresh_token);
        return navigate('/main');
      }
      if ('provider' in data) {
        setSignupUserInfo(data as SignUpUserInfo);
        return navigate('/sign-up');
      }
      throw data;
    },
    onError: (res: Response) => {
      setError('Login request failed');
      throw res;
    },
  });
  return mutation;
}

function useLogin(
  setIs2FaRequired: (is2FaRequired: boolean) => void,
  tempAccessTokenRef: React.MutableRefObject<string>,
) {
  const params = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { mutate } = useLoginMutation(
    setError,
    setIs2FaRequired,
    tempAccessTokenRef,
  );

  useEffect(() => {
    const provider: string = params.provider || '';
    const urlQuery = new URLSearchParams(window.location.search);
    const code = urlQuery.get('code');

    if (!code) {
      setError('code must be required');
      return;
    }
    if (!['42', 'google', 'kakao'].includes(provider)) {
      setError('unknown provider');
      return;
    }
    mutate({ provider, code });
  }, [params, mutate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      navigate('/', { replace: true });
    }
  }, [error, navigate]);
}

const Login = () => {
  const tempAccessToken = useRef<string>('');
  const [is2FaRequired, setIs2FaRequired] = useState(false);
  const [secret, setSecret] = useState('');
  const setAccessToken = useSetRecoilState(accessTokenState);
  const navigate = useNavigate();

  useLogin(setIs2FaRequired, tempAccessToken);

  /* functions ================================================================ */

  const onChangeSecret = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecret(e.target.value);
  };

  const submit2FaSecret = async () => {
    const res = await fetch(`${BASE_API_URL}/auth/2fa/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tempAccessToken.current}`,
      },
      body: JSON.stringify({
        otp: secret,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setAccessToken(data.access_token);
      window.localStorage.setItem('refresh_token', data.refresh_token);
      navigate('/main');
    } else {
      const data = await res.json();
      toast.error(data);
      toast.error('2fa failed. please try again');
    }
  };

  /* ========================================================================= */

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-true-gray">
      {is2FaRequired && (
        <div className="flex flex-col items-center justify-center font-pixel text-white">
          <div className={`flex flex-col items-center`}>
            <span className={`mb-2 text-sm`}> Secret </span>
            <input
              className="mb-4 h-10 w-48 bg-white text-true-gray"
              type="text"
              value={secret}
              onChange={onChangeSecret}
            />
          </div>
          <Button
            onClick={submit2FaSecret}
            className={`bg-true-green-600 text-xs`}
          >
            submit
          </Button>
        </div>
      )}
      {!is2FaRequired && (
        <div className="m-auto font-pixel text-2xl text-white">Loading...</div>
      )}
    </div>
  );
};

export default Login;
