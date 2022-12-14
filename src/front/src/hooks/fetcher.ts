import { accessTokenState } from '@/states/user/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';

export const BASE_API_URL = import.meta.env.VITE_REQUEST_URL;

export function useFetcher() {
  const accessToken = useRecoilValue(accessTokenState);
  const queryClient = useQueryClient();

  const fetcherWrapper = (
    url: string,
    options: RequestInit = {},
    contentType = 'application/json',
  ) =>
    fetcher(url, accessToken, options, contentType)
      .then((res) => {
        if (res.status === 401) throw res;
        else return res;
      })
      .catch((e) => {
        if (e instanceof Response) {
          if (e.status === 401) {
            queryClient.invalidateQueries({ queryKey: ['auth/refresh'] });
          }
        }
        throw e;
      });
  return fetcherWrapper;
}

export async function fetcher(
  url: string,
  token: string | null,
  options: RequestInit = {},
  contentType: string,
) {
  options = appendAccessToken(token, options);

  if (options.body && contentType !== '') {
    options.headers = {
      ...options.headers,
      'content-type': contentType,
    };
  }

  const res = await fetch(BASE_API_URL + url, options);

  return res;
}

export async function refreshAccessToken() {
  const refresh_token = window.localStorage.getItem('refresh_token');

  if (!refresh_token) {
    throw new Response('No refresh token found', { status: 401 });
  }

  const res = await fetch(BASE_API_URL + '/auth/refresh', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ refresh_token }),
  });

  return res;
}

function appendAccessToken(accessToken: string | null, options: RequestInit) {
  if (accessToken) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }
  return options;
}
