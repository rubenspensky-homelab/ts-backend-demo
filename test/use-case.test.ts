import { describe, expect, it } from "vitest";
import { GetDemoUserUseCase } from "../src/application/use-cases/get-demo-user.use-case";
import { DemoUser } from "../src/domain/entities/demo-user.entity";

describe("GetDemoUserUseCase", () => {
  it("returns a mapped demo user dto", async () => {
    const useCase = new GetDemoUserUseCase({
      findById: async (id: string) => new DemoUser(id, "Template User"),
    });

    const result = await useCase.execute({
      id: "42",
      requestContext: { requestId: "request-1", userId: "tester" },
    });

    expect(result).toEqual({ id: "42", name: "Template User" });
  });
});
