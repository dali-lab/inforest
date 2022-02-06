import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull,
} from "sequelize-typescript";
import { Plot as IPlot } from "@ong-forestry/schema";
import Plot from "db/models/plot";
import TreeStatus from "db/models/tree-status";
import TreeSpecies from "db/models/tree-species";
import TreePhoto from "db/models/tree-photo";
import Trip from "./trip";

import {
  Tree as ITree,
  TreePhoto as ITreePhoto,
  TreeSpecies as ITreeSpecies,
  TreeStatus as ITreeStatus,
  Trip as ITrip,
} from "@ong-forestry/schema";

@Table({
  tableName: "trees",
  indexes: [
    {
      name: "absolute_position",
      fields: ["lat", "long"],
    },
    {
      name: "relative_position",
      fields: ["plotX", "plotY"],
    },
  ],
})
class Tree extends Model<ITree> implements ITree {
  @PrimaryKey
  @Column(DataTypes.STRING)
  tag: string;

  @ForeignKey(() => Plot)
  @Column(DataTypes.INTEGER)
  @AllowNull(false)
  plotNumber: number;

  @BelongsTo(() => Plot)
  plot: IPlot;

  @Column(DataTypes.FLOAT)
  lat: number;

  @Column(DataTypes.FLOAT)
  long: number;

  @Column(DataTypes.FLOAT)
  plotX: number;

  @Column(DataTypes.FLOAT)
  plotY: number;

  @Column(DataTypes.FLOAT)
  dbh: number;

  @Column(DataTypes.FLOAT)
  height: number;

  @ForeignKey(() => TreeSpecies)
  @Column(DataTypes.STRING)
  speciesCode: string;

  @BelongsTo(() => TreeSpecies)
  species: ITreeSpecies;

  @ForeignKey(() => TreeStatus)
  @Column(DataTypes.UUID)
  statusName: string;

  @BelongsTo(() => TreeStatus)
  status: ITreeStatus;

  @HasMany(() => TreePhoto)
  photos: ITreePhoto[];

  @ForeignKey(() => Trip)
  @Column(DataTypes.STRING)
  tripId: string;

  @BelongsTo(() => Trip)
  trip: ITrip;
}

export default Tree;
