import { Op } from "sequelize";
import { VerificationCode } from "@ong-forestry/schema";
import VerificationCodeModel from "db/models/verification-code";

const generateCode = () => {
  const length = 6;
  const a = "a".charCodeAt(0);
  const z = "z".charCodeAt(0);

  var code = "";
  for (var i = 0; i < length; i++)
    code += String.fromCharCode(Math.floor(Math.random() * (z - a + 1)) + a);

  return code;
};

export const createVerificationCode = async (
  params: Pick<VerificationCode, "email">
) => {
  // delete any previous code that may have existed
  await deleteVerificationCode(params);

  return await VerificationCodeModel.create({
    ...params,
    code: generateCode(),
    expiration: new Date(new Date().getTime() + 5 * 60 * 1000), // 5 minutes from now
  });
};

export const getVerificationCode = async (
  params: Pick<VerificationCode, "email">
) => {
  return await VerificationCodeModel.findByPk(params.email);
};

export const deleteVerificationCode = async (
  params: Pick<VerificationCode, "email">
) => {
  return await VerificationCodeModel.destroy({
    where: { email: { [Op.eq]: params.email } },
  });
};
