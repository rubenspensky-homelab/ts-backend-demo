import type { Logger } from "../../../shared/observability/logging/types";
import type { GetDemoUserUseCase } from "../../../application/use-cases/get-demo-user.use-case";
import type { RequestContext } from "../../../shared/auth/request-context/request-context.types";

export class DemoController {
  constructor(
    private readonly getDemoUserUseCase: GetDemoUserUseCase,
    private readonly logger: Logger,
  ) {}

  async getUser(id: string, requestContext: RequestContext) {
    const user = await this.getDemoUserUseCase.execute({ id });

    this.logger.event("Demo user fetched", {
      requestId: requestContext.requestId,
      event: {
        event: "demo.user.fetched",
        entity: "user",
        entityId: user.id,
      },
      user: { id: user.id },
    });

    return { user };
  }

  getError(): never {
    throw new Error("Demo error for structured logging");
  }
}
