import type { DemoUser } from "../../domain/entities/demo-user.entity";

export type DemoUserRepository = {
  findById(id: string): Promise<DemoUser>;
};
