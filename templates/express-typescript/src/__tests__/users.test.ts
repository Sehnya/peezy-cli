import request from "supertest";
import app from "../index";

describe("Users API", () => {
  describe("GET /api/v1/users", () => {
    it("should return all users", async () => {
      const response = await request(app).get("/api/v1/users").expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /api/v1/users/:id", () => {
    it("should return a user by id", async () => {
      const response = await request(app).get("/api/v1/users/1").expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id", "1");
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app).get("/api/v1/users/999").expect(404);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/v1/users", () => {
    it("should create a new user", async () => {
      const newUser = {
        name: "John Doe",
        email: "john@example.com",
        age: 30,
      };

      const response = await request(app)
        .post("/api/v1/users")
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("name", newUser.name);
      expect(response.body.data).toHaveProperty("email", newUser.email);
    });

    it("should return 400 for invalid user data", async () => {
      const invalidUser = {
        name: "", // Invalid: empty name
        email: "invalid-email", // Invalid: bad email format
        age: -5, // Invalid: negative age
      };

      const response = await request(app)
        .post("/api/v1/users")
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PUT /api/v1/users/:id", () => {
    it("should update an existing user", async () => {
      const updatedUser = {
        name: "Jane Doe",
        email: "jane@example.com",
        age: 25,
      };

      const response = await request(app)
        .put("/api/v1/users/1")
        .send(updatedUser)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("name", updatedUser.name);
    });

    it("should return 404 for non-existent user", async () => {
      const updatedUser = {
        name: "Jane Doe",
        email: "jane@example.com",
        age: 25,
      };

      const response = await request(app)
        .put("/api/v1/users/999")
        .send(updatedUser)
        .expect(404);

      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    it("should delete an existing user", async () => {
      const response = await request(app).delete("/api/v1/users/1").expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .delete("/api/v1/users/999")
        .expect(404);

      expect(response.body).toHaveProperty("success", false);
    });
  });
});
