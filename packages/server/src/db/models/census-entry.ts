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
  BelongsToMany,
  Default,
} from "sequelize-typescript";
import Tree from "db/models/tree";
import TreeStatus from "db/models/tree-status";
import TreePhoto from "db/models/tree-photo";
import TreeLabel from "db/models/tree-label";
import TreeTreeLabel from "db/models/tree-tree-label";
import Trip from "db/models/trip";
import User from "db/models/user";

import {
  Tree as ITree,
  CensusEntry as ICensusEntry,
  TreePhoto as ITreePhoto,
  TreeStatus as ITreeStatus,
  TreeLabel as ITreeLabel,
  Trip as ITrip,
  User as IUser,
} from "@ong-forestry/schema";

@Table({
  tableName: "census_entries",
  indexes: [
    {
      name: "dbh",
      fields: ["dbh"],
    },
    {
      name: "height",
      fields: ["height"],
    },
  ],
})
class CensusEntry
  extends Model<ICensusEntry>
  implements Omit<ICensusEntry, "createdAt" | "updatedAt">
{
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  id: string;

  @ForeignKey(() => Tree)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  treeTag: string;

  @BelongsTo(() => Tree)
  tree: ITree;

  @Column(DataTypes.FLOAT)
  dbh: number;

  @Column(DataTypes.FLOAT)
  height: number;

  @BelongsToMany(() => TreeLabel, () => TreeTreeLabel)
  labels: ITreeLabel[];

  @HasMany(() => TreePhoto)
  photos: ITreePhoto[];

  @ForeignKey(() => Trip)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  tripId: string;

  @BelongsTo(() => Trip)
  trip: ITrip;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  authorId: string;

  @BelongsTo(() => User)
  author: IUser;
}

export default CensusEntry;
