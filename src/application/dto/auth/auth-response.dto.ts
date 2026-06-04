export interface AuthUserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

export interface AuthResponseDTO {
  user: AuthUserDTO;
  token: string;
}
