import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  AllowNull,
} from "sequelize-typescript";
import PlotCensus from "./plot-census";
import User from "./user";
import {
  PlotCensusAssignment as IPlotCensusAssignment,
  PlotCensus as IPlotCensus,
  User as IUser,
} from "@ong-forestry/schema";

@Table({
  tableName: "plot_census_assignment",
})
class PlotCensusAssignment
  extends Model<IPlotCensusAssignment>
  implements IPlotCensusAssignment
{
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
  id: string;

  @BelongsTo(() => PlotCensus, { onDelete: "CASCADE" })
  plotCensus: IPlotCensus;

  @ForeignKey(() => PlotCensus)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  plotCensusId: string;

  @BelongsTo(() => User, { onDelete: "CASCADE" })
  user: IUser;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  userId: string;
}

export default PlotCensusAssignment;
