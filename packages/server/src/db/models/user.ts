import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  BelongsToMany,
  AllowNull,
  Unique,
} from "sequelize-typescript";
import { User as IUser } from "@ong-forestry/schema";
import Team from "./team";
import Membership from "./membership";

@Table({
  tableName: "users",
})
class User extends Model<IUser> implements IUser {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
  id: string;

  @Unique
  @AllowNull(false)
  @Column(DataTypes.STRING)
  email: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  password: string;

  @Column(DataTypes.STRING)
  firstName?: string;

  @Column(DataTypes.STRING)
  lastName?: string;

  @Default(false)
  @AllowNull(false)
  @Column(DataTypes.BOOLEAN)
  verified: boolean;

  @BelongsToMany(() => Team, () => Membership)
  teams: Team[];
}

export default User;
