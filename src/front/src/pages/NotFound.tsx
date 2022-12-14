import Button from '@/atom/Button';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-900 font-pixel text-white">
      <span className="mb-8 text-5xl">:(</span>
      <span className="mb-8 text-3xl">404 Not Found</span>
      <Button
        className="bg-green-600"
        onClick={() => {
          navigate('/');
        }}
      >
        GO TO HOME
      </Button>
    </div>
  );
};

export default NotFound;
