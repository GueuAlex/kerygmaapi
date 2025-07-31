export class CreateReportDto {
  readonly user_id?: number;
  readonly report_config_id: number;
  readonly data?: Record<string, any>;
  readonly status?: 'draft' | 'final' | 'archived';
}
