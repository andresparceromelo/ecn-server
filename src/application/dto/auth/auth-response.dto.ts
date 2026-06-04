export interface AuthUserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponseDTO {
  user: AuthUserDTO;
  token: string;
}
