export type UserId = string;

export type SignupBody = {
  email: string;
  password: string;
};

export type User = {
  id: UserId;
  email: string;
  name?: string | null;
  imageUrl?: string | null;
  role?: "admin" | "member";
};

export function getUserDisplayName(user: Pick<User, "name" | "email">) {
  return user.name?.trim() ? user.name : user.email;
}
