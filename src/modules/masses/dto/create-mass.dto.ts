export class CreateMassDto {
  readonly celebration_type_id: number;
  readonly mass_date: string;
  readonly start_time: string;
  readonly end_time: string;
  readonly location?: string;
  readonly status?: 'active' | 'cancelled' | 'disabled_requests';
  readonly notes?: string;
  readonly created_by_user_id?: string;
}
