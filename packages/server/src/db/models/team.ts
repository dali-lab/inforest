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
import { Team as ITeam } from "@ong-forestry/schema";
import User from "./user";
import Membership from "./membership";

@Table({
  tableName: "teams",
})
class Team extends Model<ITeam> implements ITeam {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
  id?: string;

  @Column(DataTypes.STRING)
  @AllowNull(false)
  name?: string;

  @Column(DataTypes.STRING)
  description?: string;

  @BelongsToMany(() => User, () => Membership)
  members?: User[];
}

export default Team;
