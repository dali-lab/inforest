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
  AllowNull,
} from "sequelize-typescript";
import Team from "./team";
import Plot from "./plot";
import ForestCensus from "./forest-census";
import {
  Forest as IForest,
  ForestCensus as IForestCensus,
  Plot as IPlot,
  Team as ITeam,
} from "@ong-forestry/schema";

@Table({
  tableName: "forests",
})
class Forest extends Model<IForest> implements IForest {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
  id: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  name: string;

  @Column(DataTypes.STRING)
  description: string;

  @HasMany(() => Plot)
  plots: IPlot[];

  @ForeignKey(() => Team)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  teamId: string;

  @BelongsTo(() => Team)
  team: ITeam;

  @HasMany(() => ForestCensus)
  censuses: IForestCensus[];
}

export default Forest;
