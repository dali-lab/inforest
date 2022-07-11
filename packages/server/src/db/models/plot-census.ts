import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  HasMany,
  AllowNull,
} from "sequelize-typescript";
import ForestCensus from "./forest-census";
import TreeCensus from "./tree-census";
import Plot from "./plot";
import User from "./user";
import {
  ForestCensus as IForestCensus,
  PlotCensus as IPlotCensus,
  TreeCensus as ITreeCensus,
  Plot as IPlot,
  User as IUser,
} from "@ong-forestry/schema";
import PlotCensusAssignment from "./plot-census-assignment";
import { PlotCensusStatuses } from "../../enums";

@Table({
  tableName: "plot_census",
})
class PlotCensus extends Model<IPlotCensus> implements IPlotCensus {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
  id: string;

  @Default("IN_PROGRESS")
  @Column(DataTypes.ENUM({ values: Object.values(PlotCensusStatuses) }))
  status: PlotCensusStatuses;

  @BelongsTo(() => Plot, { onDelete: "CASCADE" })
  plot: IPlot;

  @ForeignKey(() => Plot)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  plotId: string;

  @BelongsTo(() => ForestCensus, { onDelete: "CASCADE" })
  forestCensus: IForestCensus;

  @ForeignKey(() => ForestCensus)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  forestCensusId: string;

  @BelongsToMany(() => User, () => PlotCensusAssignment)
  authors: IUser[];

  @HasMany(() => TreeCensus)
  treeCensuses: ITreeCensus[];
}

export default PlotCensus;
