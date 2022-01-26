import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  ForeignKey,
} from "sequelize-typescript";
import { User as IUser } from "@ong-forestry/schema";
import Team from "./team"

@Table({
  tableName: "users",
})
class User extends Model<IUser> implements IUser {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
  id?: string;

  @Column(DataTypes.STRING)
  email?: string;

  @Column(DataTypes.STRING)
  password?: string;

  @Column(DataTypes.STRING)
  firstName?: string;

  @Column(DataTypes.STRING)
  lastName?: string;

  @Default(false)
  @Column(DataTypes.BOOLEAN)
  verified?: boolean

  @ForeignKey(() => Team)
  @Column(DataTypes.INTEGER)
  team?: number

}

export default User;
