import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Forest as IForest, Plot as IPlot } from "@ong-forestry/schema";
import Forest from "./forest"

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
  id?: string;

  @Column(DataTypes.STRING)
  name?: string;

  @Column(DataTypes.FLOAT)
  lat?: number;

  @Column(DataTypes.FLOAT)
  long?: number;

  @Column(DataTypes.FLOAT)
  length?: number;

  @Column(DataTypes.FLOAT)
  width?: number;

  @ForeignKey(()=> Forest)
  @Column(DataTypes.INTEGER)
  forestId?:number

  @BelongsTo(()=>Forest)
  forest?:IForest
}

export default Plot;
