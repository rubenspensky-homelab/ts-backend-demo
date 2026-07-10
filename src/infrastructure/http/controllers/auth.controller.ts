export class AuthController {
  getMe(authenticatedUser: NonNullable<Express.Request["authenticatedUser"]>) {
    return authenticatedUser;
  }

  getAuthTest(authenticatedUser: NonNullable<Express.Request["authenticatedUser"]>) {
    return {
      authenticated: true as const,
      user: authenticatedUser,
    };
  }
}
