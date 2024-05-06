import { IconEdit, IconTrash, IconRestore } from "@tabler/icons-react";
import { getOptimalTextColor } from "~/helpers/getOptimalTextColor";
import { User, Tag } from "~/types/graphql";

export type TUserTableLine = {
  user: User;
  handleEdit?: (user: User) => void;
  handleRemove?: (user: User) => void;
  handleRestore?: (user: User) => void;
};

export const UserTableLine = ({
  user,
  handleEdit,
  handleRemove,
  handleRestore,
}: TUserTableLine) => {
  const editUser = () => {
    if (!handleEdit) return;
    handleEdit(user);
  };
  const removeUser = () => {
    if (!handleRemove) return;
    handleRemove(user);
  };
  const restoreUser = () => {
    if (!handleRestore) return;
    handleRestore(user);
  };
  return (
    <tr
      className={`${
        user.isActive ? "bg-violet-50" : "bg-red-400"
      } py-1 transition hover:bg-gray-300`}
    >
      <td className="px-2 text-sm">{user.name}</td>
      <td className="px-2"> {user.username} </td>
      <td className="px-2"> {user.password} </td>

      <td className="flex flex-row gap-2 px-2 font-normal text-gray-500">
        <IconEdit
          className="cursor-pointer select-none transition hover:bg-gray-400"
          onClick={() => editUser()}
        />
        {user.isActive ? (
          <IconTrash
            className="cursor-pointer select-none transition hover:bg-gray-400"
            onClick={() => removeUser()}
          />
        ) : (
          <IconRestore
            className="cursor-pointer select-none transition hover:bg-gray-400"
            onClick={() => restoreUser()}
          />
        )}
      </td>
    </tr>
  );
};
