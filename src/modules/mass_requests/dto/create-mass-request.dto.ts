export class CreateMassRequestDto {
  readonly requester_user_id?: number;
  readonly requester_name: string;
  readonly requester_phone?: string;
  readonly requester_email?: string;
  readonly mass_request_type_id: number;
  readonly message_additionnel?: string;
  readonly total_amount: number;
  readonly status?:
    | 'pending_payment'
    | 'paid'
    | 'scheduled'
    | 'completed'
    | 'cancelled'
    | 'reported';
}
