import {
  Table,
  Column,
  Model,
  ForeignKey,
} from "sequelize-typescript";
import { Membership as IMembership } from "@ong-forestry/schema";
import Team from "./team";
import User from "./user"

@Table({
  tableName: "memberships",
})
class Membership extends Model<IMembership> implements IMembership {
    @ForeignKey(() => Team)
    @Column
    team?: Team

    @ForeignKey(()=> User)
    @Column
    user?: User
}

export default Membership;
