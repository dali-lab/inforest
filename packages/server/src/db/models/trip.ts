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
import Forest from "db/models/forest";
import TreeCensus from "db/models/tree-census";
import {
  TreeCensus as ITreeCensus,
  Trip as ITrip,
  Forest as IForest,
} from "@ong-forestry/schema";

@Table({
  tableName: "trips",
})
class Trip extends Model<ITrip> implements ITrip {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
  id: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  name: string;

  @BelongsTo(() => Forest)
  forest: IForest;

  @ForeignKey(() => Forest)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  forestId: string;

  @HasMany(() => TreeCensus)
  censusedTrees: ITreeCensus[];
}

export default Trip;
