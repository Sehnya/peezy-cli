import { Router } from "express";
import { UserController } from "@/controllers/UserController";
import { validateUser } from "@/middleware/validation";

const router = Router();
const userController = new UserController();

// GET /api/v1/users
router.get("/", userController.getUsers);

// GET /api/v1/users/:id
router.get("/:id", userController.getUserById);

// POST /api/v1/users
router.post("/", validateUser, userController.createUser);

// PUT /api/v1/users/:id
router.put("/:id", validateUser, userController.updateUser);

// DELETE /api/v1/users/:id
router.delete("/:id", userController.deleteUser);

export { router as userRoutes };
