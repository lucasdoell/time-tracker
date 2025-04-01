export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
};

export type Session = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type AuthSession = {
  user: User;
  session: Session;
};

export type AuthResponse = {
  user: User;
  token: string | null;
  redirect?: boolean;
  url?: string;
};
