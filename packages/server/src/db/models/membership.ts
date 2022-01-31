import {
  Table,
  Column,
  Model,
  ForeignKey,
  PrimaryKey,
  Default,
} from "sequelize-typescript";
import { Membership as IMembership, MembershipRoles } from "@ong-forestry/schema";
import Team from "./team";
import User from "./user"
import { DataTypes } from "sequelize";

const membershipRoles = ["ADMIN","MEMBER"]

@Table({
  tableName: "memberships",
})
class Membership extends Model<IMembership> implements IMembership {
    @PrimaryKey
    @Default(DataTypes.UUIDV4)
    @Column({ type: DataTypes.UUID })
    id?: string;

    @ForeignKey(() => Team)
    @Column(DataTypes.STRING)
    teamId?: string

    @ForeignKey(()=> User)
    @Column(DataTypes.STRING)
    userId?: string

    @Column(DataTypes.ENUM({values:membershipRoles}))
    role?: MembershipRoles
}

export default Membership;
