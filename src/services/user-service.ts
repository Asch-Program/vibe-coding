import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";
import type {
  RegisterRequestBody,
  LoginRequestBody,
  RegisterResponseData,
  LoginResponseData,
} from "../models/user-model";

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
    | { success: false; error: "WRONG_EMAIL_OR_PASSWORD" }
  > {
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    const user = existingUsers[0];
    if (!user) {
      return { success: false, error: "WRONG_EMAIL_OR_PASSWORD" };
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: "WRONG_EMAIL_OR_PASSWORD" };
    }

    const sessionToken = uuidv4();

    await db.insert(sessions).values({
      token: sessionToken,
      userId: user.id,
    });

    return {
      success: true,
      data: {
        token: sessionToken,
      },
    };
  }
}
