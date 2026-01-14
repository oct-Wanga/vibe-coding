import type {User} from "../model/user";

type Props = {
  user: Pick<User, "name" | "email" | "imageUrl">;
  size?: number;
};

export function UserAvatar({user, size = 32}: Props) {
  const label = (user.name || user.email || "?").slice(0, 1).toUpperCase();

  return (
    <div
      className="inline-flex items-center justify-center rounded-full bg-gray-200 text-xs font-semibold"
      style={{width: size, height: size}}
      aria-label="user avatar"
      title={user.name ?? user.email}
    >
      {user.imageUrl ? (
        // 실제 프로젝트에선 next/image로 교체 권장
        <img
          src={user.imageUrl}
          alt="avatar"
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span>{label}</span>
      )}
    </div>
  );
}
