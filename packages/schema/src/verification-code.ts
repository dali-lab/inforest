/**
 * Verification codes sent to a user
 */
export interface VerificationCode {
  /**
   * The email of the user sent this verification code. Primary key
   */
  email: string;

  /**
   * The code emailed to the user
   */
  code: string;

  /**
   * Date+time this code expires.
   */
  expiration: Date;
}
