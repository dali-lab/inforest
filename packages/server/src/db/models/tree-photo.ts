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
import CensusEntry from "db/models/census-entry";
import {
  CensusEntry as ICensusEntry,
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
class TreePhoto extends Model<ITreePhoto> implements ITreePhoto {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  id: string;

  @ForeignKey(() => CensusEntry)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  censusEntryId: string;

  @BelongsTo(() => CensusEntry)
  censusEntry: ICensusEntry;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  url: string;

  @ForeignKey(() => TreePhotoPurpose)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  purposeName: string;

  @BelongsTo(() => TreePhotoPurpose)
  purpose: ITreePhotoPurpose;
}

export default TreePhoto;
