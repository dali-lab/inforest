import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default,
} from "sequelize-typescript";
import {
  Forest as IForest,
  Plot as IPlot,
  PlotCensus as IPlotCensus,
} from "@ong-forestry/schema";
import Forest from "./forest";
import PlotCensus from "./plot-census";

@Table({
  tableName: "plots",
  indexes: [
    {
      name: "position",
      fields: ["lat", "long"],
    },
  ],
})
class Plot extends Model<IPlot> implements IPlot {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
  id: string;

  @AutoIncrement
  @Column(DataTypes.STRING)
  number: string;

  @Column(DataTypes.FLOAT)
  latitude: number;

  @Column(DataTypes.FLOAT)
  longitude: number;

  @Column(DataTypes.FLOAT)
  length: number;

  @Column(DataTypes.FLOAT)
  width: number;

  @ForeignKey(() => Forest)
  @Column(DataTypes.STRING)
  forestId: string;

  @BelongsTo(() => Forest)
  forest: IForest;

  @HasMany(() => PlotCensus)
  censuses: IPlotCensus[];
}

export default Plot;
