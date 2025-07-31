export class CreatePaymentDto {
  readonly user_id?: number;
  readonly gateway_id: number;
  readonly amount: number;
  readonly currency: string;
  readonly status: string;
  readonly meta?: Record<string, any>;
}
