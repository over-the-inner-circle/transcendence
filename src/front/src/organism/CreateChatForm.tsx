import { useState } from 'react';
import Button from '@/atom/Button';
import { RoomInfo } from '@/states/roomInfoState';
import { useAddChatRoom } from '@/hooks/mutation/chat';

function CreateChatForm() {
  const [name, setName] = useState('');
  const [accessType, setAccessType] =
    useState<RoomInfo['room_access']>('public');
  const [password, setPassword] = useState('');
  const addChatRoom = useAddChatRoom(name, accessType, password);

  return (
    <form
      className="flex h-fit w-full shrink-0 flex-col items-center gap-3
                 border-b border-neutral-400 bg-neutral-800 p-3 text-sm"
      onSubmit={addChatRoom.mutate}
      method="POST"
    >
      <div className="flex w-full flex-row items-center justify-start">
        <label htmlFor="room_name">name:</label>
        <input
          className="ml-2 w-full border-b-4 border-white bg-inherit"
          name="room_name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="flex w-full flex-row items-center justify-start">
        <label htmlFor="room_access">type:</label>
        <select
          name="room_access"
          className="ml-2 w-full bg-neutral-500 p-1"
          value={accessType}
          onChange={(e) =>
            setAccessType(e.target.value as RoomInfo['room_access'])
          }
        >
          <option value="public">Public</option>
          <option value="protected">Protected</option>
          <option value="private">Private</option>
        </select>
      </div>
      {accessType === 'protected' ? (
        <div className="flex w-full flex-row items-center justify-start">
          <label htmlFor="room_password">password:</label>
          <input
            className="ml-2 w-full border-b-4 border-white bg-inherit"
            name="room_password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      ) : null}
      <Button
        className="w-full bg-green-600"
        type="submit"
        disabled={addChatRoom.isLoading}
      >
        Create Room
      </Button>
    </form>
  );
}

export default CreateChatForm;
