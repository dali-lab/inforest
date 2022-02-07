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
  @Column(DataTypes.UUID)
  @Default(DataTypes.UUIDV4)
  id: string;

  @ForeignKey(() => Tree)
  @Column(DataTypes.STRING)
  @AllowNull(false)
  treeTag: string;

  @BelongsTo(() => Tree)
  tree: ITree;

  @Column(DataTypes.STRING)
  @AllowNull(false)
  url: string;

  @Column(DataTypes.STRING)
  @AllowNull(false)
  @ForeignKey(() => TreePhotos)
  purposeName: string;

  @BelongsTo(() => TreePhotos)
  purpose: ITreePhotoPurpose;
}

export default TreePhotos;
