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
import TreePhoto from "db/models/tree-photo";
import TreeLabel from "db/models/tree-label";
import TreeCensusLabel from "db/models/tree-census-label";
import Trip from "db/models/trip";
import User from "db/models/user";

import {
  Tree as ITree,
  TreeCensus as ITreeCensus,
  TreePhoto as ITreePhoto,
  TreeLabel as ITreeLabel,
  Trip as ITrip,
  User as IUser,
} from "@ong-forestry/schema";

@Table({
  tableName: "tree_census",
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
class TreeCensus
  extends Model<ITreeCensus>
  implements Omit<ITreeCensus, "createdAt" | "updatedAt">
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

  @BelongsToMany(() => TreeLabel, () => TreeCensusLabel)
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

export default TreeCensus;
