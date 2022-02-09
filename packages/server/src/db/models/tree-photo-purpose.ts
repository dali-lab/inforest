import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  HasMany,
} from "sequelize-typescript";
import Tree from "db/models/tree";
import {
  TreePhoto as ITreePhoto,
  TreePhotoPurpose as ITreePhotoPurpose,
} from "@ong-forestry/schema";

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

  @HasMany(() => Tree)
  photos: ITreePhoto[];
}

export default TreePhotoPurpose;
