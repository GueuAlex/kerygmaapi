export class CreateOfferingDto {
  readonly offering_type_id: number;
  readonly user_id?: number;
  readonly amount: number;
  readonly message?: string;
}
