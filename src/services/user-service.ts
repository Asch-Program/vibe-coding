import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import type {
  RegisterRequestBody,
  LoginRequestBody,
  RegisterResponseData,
  LoginResponseData,
} from "../models/user-model";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default-refresh-secret";
const JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN || "3600", 10);

export class UserService {
  static async register(body: RegisterRequestBody): Promise<
    | { success: true; data: RegisterResponseData }
    | { success: false; error: "USER_ALREADY_EXISTS" }
  > {
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    const existingUser = existingUsers[0];
    if (existingUser) {
      return { success: false, error: "USER_ALREADY_EXISTS" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    const generatedUuid = `usr_${uuidv4()}`;

    await db.insert(users).values({
      uuid: generatedUuid,
      username: body.username,
      email: body.email,
      password: hashedPassword,
      isVerified: false,
      roles: ["user"],
    });

    return {
      success: true,
      data: {
        user_id: generatedUuid,
        email: body.email,
        is_verified: false,
      },
    };
  }

  static async login(body: LoginRequestBody): Promise<
    | { success: true; data: LoginResponseData }
    | { success: false; error: "INVALID_CREDENTIALS" }
  > {
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    const user = existingUsers[0];
    if (!user) {
      return { success: false, error: "INVALID_CREDENTIALS" };
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: "INVALID_CREDENTIALS" };
    }

    const accessToken = jwt.sign(
      {
        uuid: user.uuid,
        email: user.email,
        roles: user.roles,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      {
        uuid: user.uuid,
      },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return {
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: JWT_EXPIRES_IN,
        user: {
          uuid: user.uuid,
          name: user.username,
          roles: user.roles,
        },
      },
    };
  }
}
