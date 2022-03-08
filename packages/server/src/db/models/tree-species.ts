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
import { TreeSpeciesTypes } from "@ong-forestry/schema/src/tree";

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
  code: string;

  @HasMany(() => Tree)
  trees: ITree[];

  @AllowNull(false)
  @Column(DataTypes.STRING)
  name: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  family: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  genus: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  commonName: string;

  @AllowNull(false)
  @Column(
    DataTypes.ENUM({
      values: [TreeSpeciesTypes.Conifer, TreeSpeciesTypes.Deciduous],
    })
  )
  type: TreeSpeciesTypes;
}

export default TreeSpecies;
