import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer, Slide } from 'react-toastify';

import Intro from '@/pages/Intro';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Main from '@/pages/Main';
import NotFound from '@/pages/NotFound';

import 'react-toastify/dist/ReactToastify.min.css';

const queryClient = new QueryClient();

function App() {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Intro />} />
            <Route path="/login/:provider" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/main" element={<Main />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer
            position="top-center"
            theme="dark"
            transition={Slide}
            closeOnClick={false}
            closeButton={true}
            toastClassName="bg-neutral-900 p-1 m-0 w-fit"
            bodyClassName="font-pixel text-xs text-white p-3 w-full"
          />
        </BrowserRouter>
      </QueryClientProvider>
    </RecoilRoot>
  );
}

export default App;
