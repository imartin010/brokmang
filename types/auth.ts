/**
 * Auth Types - User Type & Authentication State
 * Brokmang. Dashboard System
 */

export type UserType = 'CEO' | 'TeamLeader';

export interface AuthShape {
  userId: string | null;
  email: string | null;
  userType: UserType | null; // never undefined
  isLoading: boolean;
  setUserType: (t: UserType) => void;
  setAuth: (payload: Partial<Pick<AuthShape, 'userId' | 'email' | 'userType' | 'isLoading'>>) => void;
  reset: () => void;
}
