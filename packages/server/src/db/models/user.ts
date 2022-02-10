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
import { User as IUser, Team as ITeam } from "@ong-forestry/schema";
import Team from "db/models/team";
import Membership from "db/models/membership";

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
  firstName: string;

  @Column(DataTypes.STRING)
  lastName: string;

  @Default(false)
  @AllowNull(false)
  @Column(DataTypes.BOOLEAN)
  verified: boolean;

  @BelongsToMany(() => Team, () => Membership)
  teams: ITeam[];
}

export default User;
