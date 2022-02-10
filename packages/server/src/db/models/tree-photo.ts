import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  AllowNull,
} from "sequelize-typescript";
import Tree from "db/models/tree";
import TreePhotoPurpose from "db/models/tree-photo-purpose";
import {
  Tree as ITree,
  TreePhoto as ITreePhoto,
  TreePhotoPurpose as ITreePhotoPurpose,
} from "@ong-forestry/schema";

@Table({
  tableName: "tree_photos",
  indexes: [
    {
      name: "type",
      fields: ["type"],
    },
  ],
})
class TreePhotos extends Model<ITreePhoto> implements ITreePhoto {
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

  @AllowNull(false)
  @Column(DataTypes.STRING)
  url: string;

  @AllowNull(false)
  @ForeignKey(() => TreePhotoPurpose)
  @Column(DataTypes.STRING)
  purposeName: string;

  @BelongsTo(() => TreePhotoPurpose)
  purpose: ITreePhotoPurpose;
}

export default TreePhotos;
