import aria from "@/assets/trainer-aria.jpg";
import max from "@/assets/trainer-max.jpg";
import kai from "@/assets/trainer-kai.jpg";
import nova from "@/assets/trainer-nova.jpg";
import rex from "@/assets/trainer-rex.jpg";

export type Trainer = {
  id: string;
  name: string;
  style: string;
  personality: string;
  accent: "green" | "orange" | "yellow";
  image: string;
};

export const TRAINERS: Trainer[] = [
  {
    id: "aria",
    name: "Aria",
    style: "Balanced Coach",
    personality: "Warm, precise and always focused on your next small win.",
    accent: "green",
    image: aria,
  },
  {
    id: "max",
    name: "Max",
    style: "Strength Specialist",
    personality: "Direct and intense. Short sentences. Loves heavy compounds.",
    accent: "orange",
    image: max,
  },
  {
    id: "kai",
    name: "Kai",
    style: "Conditioning Coach",
    personality: "Upbeat and energetic. Big on consistency over perfection.",
    accent: "yellow",
    image: kai,
  },
  {
    id: "nova",
    name: "Nova",
    style: "Mobility & Recovery",
    personality: "Calm and mindful. Reminds you that recovery is training.",
    accent: "green",
    image: nova,
  },
  {
    id: "rex",
    name: "Rex",
    style: "Veteran Bodybuilder",
    personality: "Old-school and steady. Technique first, ego last.",
    accent: "orange",
    image: rex,
  },
];

export function getTrainer(id: string | undefined): Trainer {
  return TRAINERS.find((t) => t.id === id) ?? TRAINERS[0]!;
}
