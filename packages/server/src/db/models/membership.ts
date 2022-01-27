import {
  Table,
  Column,
  Model,
  ForeignKey,
} from "sequelize-typescript";
import { Membership as IMembership } from "@ong-forestry/schema";
import Team from "./team";
import User from "./user"
import { DataTypes } from "sequelize";

@Table({
  tableName: "memberships",
})
class Membership extends Model<IMembership> implements IMembership {
    @ForeignKey(() => Team)
    @Column(DataTypes.STRING)
    teamId?: string

    @ForeignKey(()=> User)
    @Column(DataTypes.STRING)
    userId?: string
}

export default Membership;
