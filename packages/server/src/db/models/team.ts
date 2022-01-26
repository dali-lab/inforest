import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  HasMany,
} from "sequelize-typescript";
import { Team as ITeam } from "@ong-forestry/schema";
import User from "./user";

@Table({
  tableName: "teams",
})
class Team extends Model<ITeam> implements ITeam {
    @PrimaryKey
    @Default(DataTypes.UUIDV4)
    @Column({ type: DataTypes.UUID })
    id?: string;

    @Column(DataTypes.STRING)
    name?: string;

    @Column(DataTypes.STRING)
    description?: string;

    @HasMany(()=> User)
    admins?: User[]

    @HasMany(()=>User)
    members?: User[]
}

export default Team;
