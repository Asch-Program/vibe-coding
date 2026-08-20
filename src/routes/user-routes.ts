import { Elysia, t } from "elysia";
import { UserController } from "../controllers/user-controller";

export const userRoutes = new Elysia({ prefix: "/api" })
  .post(
    "/users",
    UserController.register,
    {
      body: t.Object({
        username: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/login",
    UserController.login,
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  );
