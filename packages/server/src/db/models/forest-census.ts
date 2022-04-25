import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull,
} from "sequelize-typescript";
import Forest from "./forest";
import PlotCensus from "./plot-census";
import {
  ForestCensus as IForestCensus,
  PlotCensus as IPlotCensus,
  Forest as IForest,
} from "@ong-forestry/schema";

@Table({
  tableName: "forest_census",
})
class ForestCensus extends Model<IForestCensus> implements IForestCensus {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
  id: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  name: string;

  @Column(DataTypes.BOOLEAN)
  active: boolean;

  @BelongsTo(() => Forest)
  forest: IForest;

  @ForeignKey(() => Forest)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  forestId: string;

  @HasMany(() => PlotCensus)
  plotCensuses: IPlotCensus[];
}

export default ForestCensus;
