import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  ForeignKey,
} from "sequelize-typescript";
import { Team as ITeam } from "@ong-forestry/schema";

@Table({
  tableName: "teams",
})
class Team extends Model<ITeam> implements ITeam {
  

}

export default Team;
