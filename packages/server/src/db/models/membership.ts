import {
  Table,
  Column,
  Model,
  ForeignKey,
  PrimaryKey,
  Default,
  AllowNull,
  BelongsTo,
} from "sequelize-typescript";
import {
  Team as ITeam,
  User as IUser,
  Membership as IMembership,
} from "@ong-forestry/schema";
import { MembershipRoles } from "../../enums";
import Team from "db/models/team";
import User from "db/models/user";
import { DataTypes } from "sequelize";

const membershipRoles = ["ADMIN", "MEMBER"];

@Table({
  tableName: "memberships",
})
class Membership extends Model<IMembership> implements IMembership {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  id: string;

  @ForeignKey(() => Team)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  teamId: string;

  @BelongsTo(() => Team)
  team: ITeam;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  userId: string;

  @BelongsTo(() => User)
  user: IUser;

  @AllowNull(false)
  @Column(DataTypes.ENUM({ values: membershipRoles }))
  role: MembershipRoles;
}

export default Membership;
