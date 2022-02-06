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
import { User as IUser, Team as ITeam} from "@ong-forestry/schema";
import Team from "./team"
import Membership from "./membership";

@Table({
  tableName: "users",
})
class User extends Model<IUser> implements IUser {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
  id: string;

  @Column(DataTypes.STRING)
  @Unique
  @AllowNull(false)
  email: string;

  @Column(DataTypes.STRING)
  @AllowNull(false)
  password: string;

  @Column(DataTypes.STRING)
  firstName: string;

  @Column(DataTypes.STRING)
  lastName: string;

  @Default(false)
  @Column(DataTypes.BOOLEAN)
  @AllowNull(false)
  verified: boolean

  @BelongsToMany(()=>Team,()=>Membership)
  teams: ITeam[]

}

export default User;
