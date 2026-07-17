import { toDemoUserDto } from "../mappers/demo-user.mapper";
import type { DemoUserRepository } from "../ports/demo-user.repository";
import type { DemoUserDto } from "../dto/demo-user.dto";

export class GetDemoUserUseCase {
  constructor(private readonly demoUserRepository: DemoUserRepository) {}

  async execute(input: { id: string }): Promise<DemoUserDto> {
    const user = await this.demoUserRepository.findById(input.id);
    return toDemoUserDto(user);
  }
}
