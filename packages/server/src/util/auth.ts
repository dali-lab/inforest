import jwt from "jsonwebtoken";
import { User, VerificationCode } from "@ong-forestry/schema";
import {
  getUsers,
  createVerificationCode,
  getVerificationCode,
} from "services";
import { emailCode } from "../util";

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
  const code = await getVerificationCode({ email: verificationCode.email });
  if (code == null || verificationCode.code != code.code) {
    throw new Error("Wrong verification code.");
  }
  if (code.expiration.getTime() < new Date().getTime()) {
    throw new Error("Verification code expired.");
  }

  return (await getUsers({ email: verificationCode.email }))[0];
};
