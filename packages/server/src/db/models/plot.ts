import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Forest as IForest, Plot as IPlot } from "@ong-forestry/schema";
import Forest from "./forest";

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
}

export default Plot;
