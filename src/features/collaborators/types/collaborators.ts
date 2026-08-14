import { verifySession } from "@/lib/dal/auth";

export type CollaboratorStatus = "online" | "offline";

export type Collaborator = {
  id: string | number;
  fullName: string;
  email: string;
};

export type Session = Awaited<ReturnType<typeof verifySession>>;
