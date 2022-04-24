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

@Table({
  tableName: "plot_census",
})
class PlotCensus extends Model<IPlotCensus> implements IPlotCensus {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
  id: string;

  @Default(false)
  @Column(DataTypes.BOOLEAN)
  approved: boolean;

  @BelongsTo(() => Plot)
  plot: IPlot;

  @ForeignKey(() => Plot)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  plotNumber: string;

  @BelongsTo(() => ForestCensus)
  forestCensus: IForestCensus;

  @ForeignKey(() => ForestCensus)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  forestCensusId: string;

  @BelongsToMany(() => User, () => PlotCensusAssignment)
  authors: IUser[];

  @HasMany(() => TreeCensus)
  treeCensuses: ITreeCensus[];
}

export default PlotCensus;
