export class RmqResponseUser {
  id: string;
  nickname: string;
  provider: string;
  thirdPartyId: string | number;
  twoFactorAuthenticationKey: string | null;
  twoFactorAuthenticationInfo: string | null;
  profImg: string;
  rankScore: number;
  createdDate: Date;
  deletedDate: Date;
}
