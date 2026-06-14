// export interface ActiveUserData {
//   /**
//    * the subject of the token (user id)
//    */
//   sub: number;
//   /**
//    * the email of the user
//    */
//   email: string;
// }

import { AccountType } from "../../generated/prisma/enums";

export interface ActiveUserData {
  sub: number;
  email?: string;
  accountType?: AccountType;
  // type?: 'access' | 'refresh';
  // principalType?: 'USER' | 'PHARMACY';
  // pharmacyId?: number;


  // إزالة كل شي في الActiveUserData ما عدا sub و email ,accountType 
}
