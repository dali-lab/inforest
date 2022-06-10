import jwt from "jsonwebtoken";
import { MembershipRoles, User, VerificationCode } from "@ong-forestry/schema";
import {
  getUsers,
  createVerificationCode,
  getVerificationCode,
  editUsers,
  deleteVerificationCode,
} from "services";
import { emailCode } from "../util";

export interface AuthUser extends User {
  role: MembershipRoles;
}

export const createToken = (user: User) => {
  const userData = { id: user.id, email: user.email };
  const token = jwt.sign(
    { user: userData },
    process.env.AUTH_SECRET as string,
    { expiresIn: "14d" } // two weeks
  );

  return token;
};

export const sendVerificationCode = async (email: string) => {
  const verificationCode = await createVerificationCode({ email });
  emailCode({ email, code: verificationCode.code });
};

export const verifyVerificationCode = async (
  verificationCode: VerificationCode
) => {
  // get user
  const user = await getUsers({ email: verificationCode.email });
  if (user.length == 0) throw new Error("No user with this email exists.");
  if (user[0].verified) throw new Error("This user is already verified.");

  const code = await getVerificationCode({ email: verificationCode.email });
  if (code == null || verificationCode.code != code.code) {
    throw new Error("Wrong verification code.");
  }
  if (code.expiration.getTime() < new Date().getTime()) {
    throw new Error("Verification code expired.");
  }

  // set user verified to true
  const verifiedUser = await editUsers(
    { verified: true },
    { email: verificationCode.email }
  );

  // delete verification code
  await deleteVerificationCode({ email: verificationCode.email });

  return verifiedUser[1][0];
};
