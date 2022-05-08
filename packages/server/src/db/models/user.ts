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
  BeforeCreate,
  HasMany,
} from "sequelize-typescript";
import bcrypt from "bcrypt";
import {
  TreeCensus as ITreeCensus,
  PlotCensus as IPlotCensus,
  User as IUser,
  Team as ITeam,
} from "@ong-forestry/schema";
import Team from "db/models/team";
import Membership from "db/models/membership";
import TreeCensus from "db/models/tree-census";
import PlotCensus from "db/models/plot-census";
import PlotCensusAssignment from "db/models/plot-census-assignment";

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

  @Default(true)
  @AllowNull(false)
  @Column(DataTypes.BOOLEAN)
  active: boolean;

  @BelongsToMany(() => Team, () => Membership)
  teams: ITeam[];

  @HasMany(() => TreeCensus)
  censusedTrees: ITreeCensus[];

  @BelongsToMany(() => PlotCensus, () => PlotCensusAssignment)
  censusedPlots: IPlotCensus[];

  @BeforeCreate
  static encryptPassword = async (instance: IUser) => {
    instance.password = await bcrypt.hash(instance.password, 10);
  };
}

export default User;
