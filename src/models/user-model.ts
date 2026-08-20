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
  message?: string;
  data?: T;
}

export interface RegisterResponseData {
  user_id: string;
  email: string;
  is_verified: boolean;
}

export interface LoginResponseData {
  token: string;
}
