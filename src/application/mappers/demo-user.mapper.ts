import type { DemoUserDto } from "../dto/demo-user.dto";
import type { DemoUser } from "../../domain/entities/demo-user.entity";

export function toDemoUserDto(user: DemoUser): DemoUserDto {
  return {
    id: user.id,
    name: user.name,
  };
}
