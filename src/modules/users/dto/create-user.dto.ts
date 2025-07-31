export class CreateUserDto {
  readonly first_name: string;
  readonly last_name: string;
  readonly email?: string;
  readonly phone?: string;
  readonly password?: string;
  readonly status?: 'active' | 'inactive' | 'suspended' | 'guest';
}
