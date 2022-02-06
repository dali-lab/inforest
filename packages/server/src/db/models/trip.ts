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
import Forest from "./forest";
import Tree from "./tree";
import {
  Trip as ITrip,
  Forest as IForest,
  Tree as ITree,
} from "@ong-forestry/schema";

@Table({
  tableName: "Trips",
})
class Trip extends Model<ITrip> implements ITrip {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column({ type: DataTypes.UUID })
  id: string;

  @Column(DataTypes.STRING)
  @AllowNull(false)
  name: string;

  @BelongsTo(() => Forest)
  forest: IForest;

  @ForeignKey(() => Forest)
  @Column(DataTypes.STRING)
  forestId: string;

  @HasMany(() => Tree)
  entries: ITree[];
}

export default Trip;
