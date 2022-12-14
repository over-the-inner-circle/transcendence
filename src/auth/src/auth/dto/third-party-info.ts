import { Expose } from 'class-transformer';

export class ThirdPartyInfo {
  @Expose()
  provider: string;
  @Expose()
  third_party_id: string;
}
