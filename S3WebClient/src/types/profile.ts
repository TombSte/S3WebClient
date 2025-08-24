export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  role?: string;
  company?: string;
  location?: string;
  joinDate?: string;
  bio?: string;
  skills: string[];
}
