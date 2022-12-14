interface OAuthProvider {
  auth_url: string;
  redirect_uri: string;
  client_id: string;
  scope?: string;
}

export function getOAuthUrl({ auth_url, ...params }: OAuthProvider) {
  const query = new URLSearchParams({
    response_type: 'code',
    ...params,
  });

  return `${auth_url}?${query.toString()}`;
}

export const providers: { [key: string]: OAuthProvider } = {
  '42': {
    auth_url: import.meta.env.VITE_FT_AUTH_URL,
    client_id: import.meta.env.VITE_FT_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_FT_REDIRECT_URL,
  },
  google: {
    auth_url: import.meta.env.VITE_GOOGLE_AUTH_URL,
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URL,
    scope: 'https://www.googleapis.com/auth/userinfo.profile',
  },
  kakao: {
    auth_url: import.meta.env.VITE_KAKAO_AUTH_URL,
    client_id: import.meta.env.VITE_KAKAO_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_KAKAO_REDIRECT_URL,
  },
};

const Intro = () => {
  return (
    <div className="stop-dragging flex h-screen bg-true-gray">
      <div className="m-auto font-pixel">
        <div className="mb-20 text-center text-7xl text-white">42pong</div>
        <div className="">
          <div className="mb-4 text-sm text-white">Start with:</div>
          <div className="flex flex-row gap-10 text-xl">
            <a
              className="text-color-42 hover:text-white"
              href={getOAuthUrl(providers['42'])}
            >
              42
            </a>
            <a
              className="text-color-kakao hover:text-white"
              href={getOAuthUrl(providers['kakao'])}
            >
              Kakao
            </a>
            <a
              className="text-blue-600 hover:text-white"
              href={getOAuthUrl(providers['google'])}
            >
              Google
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intro;
