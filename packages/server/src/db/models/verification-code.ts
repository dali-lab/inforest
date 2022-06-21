import { VerificationCode as IVerificationCode } from "@ong-forestry/schema";
import {
  AllowNull,
  Column,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { DataTypes } from "sequelize";

@Table({
  tableName: "verification_codes",
})
class VerificationCode
  extends Model<IVerificationCode>
  implements IVerificationCode
{
  @PrimaryKey
  @Column(DataTypes.STRING)
  email: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  code: string;

  @AllowNull(false)
  @Column(DataTypes.DATE)
  expiration: Date;
}

export default VerificationCode;
