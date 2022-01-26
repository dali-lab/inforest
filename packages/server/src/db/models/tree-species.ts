import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  HasMany,
  AllowNull,
} from "sequelize-typescript";
import Tree from "db/models/tree";
import {
  Tree as ITree,
  TreeSpecies as ITreeSpecies,
} from "@ong-forestry/schema";

@Table({
  tableName: "tree_species",
  indexes: [
    {
      name: "genus",
      fields: ["genus"],
    },
  ],
})
class TreeSpecies extends Model<ITreeSpecies> implements ITreeSpecies {
  @PrimaryKey
  @Column({ type: DataTypes.STRING })
  code?: string;

  @HasMany(() => Tree)
  trees?: ITree[];

  @Column(DataTypes.STRING)
  @AllowNull(false)
  name?: string;

  @Column(DataTypes.STRING)
  @AllowNull(false)
  genus?: string;
}

export default TreeSpecies;
