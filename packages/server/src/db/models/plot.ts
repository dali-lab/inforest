import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
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
  @AutoIncrement
  @Column(DataTypes.INTEGER)
  number: number;

  @Column(DataTypes.STRING)
  name: string;

  @Column(DataTypes.FLOAT)
  lat: number;

  @Column(DataTypes.FLOAT)
  long: number;

  @Column(DataTypes.FLOAT)
  length: number;

  @Column(DataTypes.FLOAT)
  width: number;
}

export default Plot;
