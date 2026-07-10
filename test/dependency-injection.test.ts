import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { buildApplication } from "../src/bootstrap/container/build-application";
import { DemoUser } from "../src/domain/entities/demo-user.entity";
import { setLoggerTransport } from "../src/shared/observability/logging/logger";

beforeEach(() => {
  setLoggerTransport({ write() {} });
});

describe("dependency injection", () => {
  it("allows infrastructure dependencies to be replaced", async () => {
    const { app } = buildApplication({
      demoUserRepository: {
        findById: async (id: string) => new DemoUser(id, "Injected User"),
      },
    });

    const res = await request(app).get("/demo/users/7");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      user: {
        id: "7",
        name: "Injected User",
      },
    });
  });
});
