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
import CensusEntry from "db/models/census-entry";
import {
  CensusEntry as ICensusEntry,
  Trip as ITrip,
  Forest as IForest,
} from "@ong-forestry/schema";

@Table({
  tableName: "Trips",
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
  @Column(DataTypes.STRING)
  forestId: string;

  @HasMany(() => CensusEntry)
  censusEntries: ICensusEntry[];
}

export default Trip;
