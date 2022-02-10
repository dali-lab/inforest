import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  BelongsToMany,
  AllowNull,
  HasMany,
} from "sequelize-typescript";
import {
  Team as ITeam,
  Forest as IForest,
  User as IUser,
} from "@ong-forestry/schema";
import User from "db/models/user";
import Membership from "db/models/membership";
import Forest from "db/models/forest";

@Table({
  tableName: "teams",
})
class Team extends Model<ITeam> implements ITeam {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
  id: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  name: string;

  @Column(DataTypes.STRING)
  description: string;

  @BelongsToMany(() => User, () => Membership)
  members: IUser[];

  @HasMany(() => Forest)
  forests: IForest[];
}

export default Team;
