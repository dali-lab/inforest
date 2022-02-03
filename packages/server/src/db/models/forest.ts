import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  HasMany,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import Team from "./team"
import Plot from "./plot"
import { Forest as IForest, Plot as IPlot, Team as ITeam } from "@ong-forestry/schema";

@Table({
  tableName: "forests",
})
class Forest extends Model<IForest> implements IForest {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
  id?: string;

  @Column(DataTypes.STRING)
  name?: string;

  @Column(DataTypes.STRING)
  description?: string;

  @HasMany(()=>Plot)
  plots?: IPlot[]

  @ForeignKey(()=>Team)
  @Column(DataTypes.INTEGER)
  teamId?: number

  @BelongsTo(()=>Team)
  team?: ITeam
}

export default Forest
