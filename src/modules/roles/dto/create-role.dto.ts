export class CreateRoleDto {
  readonly name: string;
  readonly description?: string;
  readonly permissions?: Record<string, any>;
}
