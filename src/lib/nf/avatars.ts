import a1 from "@/assets/avatar-1.jpg";
import a2 from "@/assets/avatar-2.jpg";
import a3 from "@/assets/avatar-3.jpg";
import a4 from "@/assets/avatar-4.jpg";
import a5 from "@/assets/avatar-5.jpg";

export type UserAvatar = { id: string; label: string; image: string };

export const USER_AVATARS: UserAvatar[] = [
  { id: "a1", label: "Athlete", image: a1 },
  { id: "a2", label: "Runner", image: a2 },
  { id: "a3", label: "Lifter", image: a3 },
  { id: "a4", label: "Coachable", image: a4 },
  { id: "a5", label: "Minimal", image: a5 },
];

export function getUserAvatar(id: string | undefined): UserAvatar {
  return USER_AVATARS.find((a) => a.id === id) ?? USER_AVATARS[0]!;
}
