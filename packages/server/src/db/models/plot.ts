import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
} from "sequelize-typescript";
import { Plot as IPlot } from "@ong-forestry/schema";

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
}

export default Plot;
