import { User } from "~/types/graphql";

export const SimpleUserOption = ({ user }: { user: User }) => {
  return (
    <option value={user.id} key={`user-option-${user.id}`}>
      {user.name}
    </option>
  );
};
