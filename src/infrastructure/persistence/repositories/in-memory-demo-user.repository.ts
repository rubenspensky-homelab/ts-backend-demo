import { DemoUser } from "../../../domain/entities/demo-user.entity";
import type { DemoUserRepository } from "../../../application/ports/demo-user.repository";

export class InMemoryDemoUserRepository implements DemoUserRepository {
  findById(id: string): Promise<DemoUser> {
    return Promise.resolve(new DemoUser(id, "Demo User"));
  }
}
