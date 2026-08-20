import type { Context } from "elysia";
import { UserService } from "../services/user-service";
import type { RegisterRequestBody, LoginRequestBody } from "../models/user-model";

export class UserController {
  static async register({ body, set }: { body: RegisterRequestBody; set: Context["set"] }) {
    const result = await UserService.register(body);

    if (!result.success) {
      set.status = 400;
      return {
        status: "error",
        message: "User already exists",
      };
    }

    set.status = 201;
    return {
      status: "success",
      message: "User registered successfully. Please verify your email.",
      data: result.data,
    };
  }

  static async login({ body, set }: { body: LoginRequestBody; set: Context["set"] }) {
    const result = await UserService.login(body);

    if (!result.success) {
      set.status = 401;
      return {
        status: "error",
        message: "Invalid credentials",
      };
    }

    set.status = 200;
    return {
      status: "success",
      message: "Login successful",
      data: result.data,
    };
  }
}
