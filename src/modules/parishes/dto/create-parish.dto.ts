export class CreateParishDto {
  readonly name: string;
  readonly address?: string;
  readonly contact_email?: string;
  readonly contact_phone?: string;
  readonly bank_account_info?: Record<string, any>;
  readonly mobile_money_numbers?: Record<string, any>;
}
