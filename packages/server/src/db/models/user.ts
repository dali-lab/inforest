import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  BelongsToMany,
  AllowNull,
} from "sequelize-typescript";
import { User as IUser} from "@ong-forestry/schema";
import Team from "./team"
import Membership from "./membership";

@Table({
  tableName: "users",
})
class User extends Model<IUser> implements IUser {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
  id?: string;

  @Column(DataTypes.STRING)
  @AllowNull(false)
  email?: string;

  @Column(DataTypes.STRING)
  @AllowNull(false)
  password?: string;

  @Column(DataTypes.STRING)
  firstName?: string;

  @Column(DataTypes.STRING)
  lastName?: string;

  @Default(false)
  @Column(DataTypes.BOOLEAN)
  @AllowNull(false)
  verified?: boolean

  @BelongsToMany(()=>Team,()=>Membership)
  teams?: Team[]

}

export default User;
