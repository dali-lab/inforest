import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  HasMany,
} from "sequelize-typescript";
import {
  TreePhoto as ITreePhoto,
  TreePhotoPurpose as ITreePhotoPurpose,
} from "@ong-forestry/schema";
import TreePhoto from "db/models/tree-photo";

@Table({
  tableName: "tree_photo_purposes",
})
class TreePhotoPurpose
  extends Model<ITreePhotoPurpose>
  implements ITreePhotoPurpose
{
  @PrimaryKey
  @Column(DataTypes.STRING)
  name: string;

  @HasMany(() => TreePhoto)
  photos: ITreePhoto[];
}

export default TreePhotoPurpose;
