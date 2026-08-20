export interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface BaseResponse<T = undefined> {
  status: "success" | "error";
  message: string;
  data?: T;
}

export interface RegisterResponseData {
  user_id: string;
  email: string;
  is_verified: boolean;
}

export interface UserSummary {
  uuid: string;
  name: string;
  roles: string[];
}

export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserSummary;
}
