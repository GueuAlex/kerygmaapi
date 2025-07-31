export class CreateContributionDto {
  readonly campaign_id: number;
  readonly card_id?: number;
  readonly user_id?: number;
  readonly amount: number;
  readonly contribution_date: string;
}
