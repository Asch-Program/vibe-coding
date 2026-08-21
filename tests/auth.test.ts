import { describe, it, expect, spyOn, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { userRoutes } from "../src/routes/user-routes";
import { UserService } from "../src/services/user-service";
import bcrypt from "bcryptjs";

describe("User & Session Authentication API", () => {
  const app = new Elysia().use(userRoutes);

  beforeEach(() => {
    // restore any spies if necessary
  });

  describe("POST /api/users (Registration)", () => {
    it("should return 201 and safe user data when registration succeeds", async () => {
      const mockResult = {
        success: true as const,
        data: {
          user_id: "usr_mock-uuid-1234",
          email: "newuser@example.com",
          is_verified: false,
        },
      };

      spyOn(UserService, "register").mockResolvedValue(mockResult);

      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "newuser",
            email: "newuser@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.status).toBe("success");
      expect(json.message).toBe("User registered successfully. Please verify your email.");
      expect(json.data.user_id).toBe("usr_mock-uuid-1234");
      expect(json.data.email).toBe("newuser@example.com");
      expect(json.data.is_verified).toBe(false);
      expect(json.data.password).toBeUndefined();
      expect(json.password).toBeUndefined();
    });

    it("should return 400 when user already exists", async () => {
      spyOn(UserService, "register").mockResolvedValue({
        success: false,
        error: "USER_ALREADY_EXISTS",
      });

      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "existinguser",
            email: "existing@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.status).toBe("error");
      expect(json.message).toBe("User already exists");
    });

    it("should return 422 if required body fields are missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "missing_fields",
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("POST /api/users/login (Session Login)", () => {
    it("should return 200 and session token when credentials are valid", async () => {
      const mockToken = "mock-uuid-session-token-5678";
      spyOn(UserService, "login").mockResolvedValue({
        success: true,
        data: {
          token: mockToken,
        },
      });

      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "user@example.com",
            password: "correctpassword",
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.status).toBe("success");
      expect(json.data).toBe(mockToken);
      expect(typeof json.data).toBe("string");
      expect(json.password).toBeUndefined();
    });

    it("should return 400 with 'Wrong Email or Password' when credentials are invalid", async () => {
      spyOn(UserService, "login").mockResolvedValue({
        success: false,
        error: "WRONG_EMAIL_OR_PASSWORD",
      });

      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "user@example.com",
            password: "wrongpassword",
          }),
        })
      );

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.status).toBe("error");
      expect(json.message).toBe("Wrong Email or Password");
    });

    it("should return 422 if login body validation fails", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "onlyemail@example.com",
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("Password Hashing & Security Verification", () => {
    it("should hash password with bcrypt and verify correctly", async () => {
      const plainPassword = "superSecretPassword123";
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(plainPassword, salt);

      expect(hash).not.toBe(plainPassword);
      expect(hash.startsWith("$2")).toBe(true);

      const isValid = await bcrypt.compare(plainPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare("wrongPass", hash);
      expect(isInvalid).toBe(false);
    });
  });
});
