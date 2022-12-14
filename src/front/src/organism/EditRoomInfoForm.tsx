import { useEffect, useState } from 'react';
import { useEditRoomAccess, useEditRoomPassword } from '@/hooks/mutation/chat';
import { RoomInfo } from '@/states/roomInfoState';
import Button from '@/atom/Button';

function EditRoomInfoForm({ roomInfo }: { roomInfo: RoomInfo }) {
  const [password, setPassword] = useState('');
  const [accessType, setAccessType] = useState<RoomInfo['room_access']>(
    roomInfo.room_access,
  );

  useEffect(() => {
    if (accessType !== 'protected') {
      setPassword('');
    }
  }, [accessType]);

  const editRoomAccess = useEditRoomAccess(roomInfo.room_id);
  const editRoomPassword = useEditRoomPassword(roomInfo.room_id);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (roomInfo.room_access === 'protected' || accessType === 'protected') {
      editRoomPassword.mutate(password);
    } else {
      editRoomAccess.mutate(accessType);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col items-center justify-start gap-2
                 border-b border-neutral-400 bg-neutral-800 p-2"
    >
      <div className="flex w-full flex-row items-center justify-start p-1">
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
      <div className="flex w-full flex-row items-center justify-start p-1">
        <label
          htmlFor="room_password"
          className={`${accessType !== 'protected' ? 'opacity-30' : ''}`}
        >
          password:
        </label>
        <input
          className="ml-2 w-full border-b-4 border-white bg-inherit disabled:opacity-30"
          name="room_password"
          type="password"
          disabled={accessType !== 'protected'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="h-fit w-full bg-red-500">
        Edit
      </Button>
    </form>
  );
}

export default EditRoomInfoForm;
