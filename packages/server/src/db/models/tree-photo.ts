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
import TreePhotoPurpose from "db/models/tree-photo-purpose";
import TreeCensus from "db/models/tree-census";
import {
  TreeCensus as ITreeCensus,
  TreePhoto as ITreePhoto,
  TreePhotoPurpose as ITreePhotoPurpose,
} from "@ong-forestry/schema";

@Table({
  tableName: "tree_photos",
})
class TreePhoto extends Model<ITreePhoto> implements ITreePhoto {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  id: string;

  @ForeignKey(() => TreeCensus)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  treeCensusId: string;

  @BelongsTo(() => TreeCensus)
  treeCensus: ITreeCensus;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  fullUrl: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  thumbUrl: string;

  @ForeignKey(() => TreePhotoPurpose)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  purposeName: string;

  @BelongsTo(() => TreePhotoPurpose)
  purpose: ITreePhotoPurpose;
}

export default TreePhoto;
