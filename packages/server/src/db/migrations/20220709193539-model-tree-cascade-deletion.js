"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "forest_census",
      "forest_census_forestId_fkey"
    );
    await queryInterface.addConstraint("forest_census", {
      fields: ["forestId"],
      type: "foreign key",
      references: {
        table: "forests",
        field: "id",
      },
      onDelete: "cascade",
    });
    await queryInterface.removeConstraint(
      "plot_census",
      "plot_census_forestCensusId_fkey"
    );
    await queryInterface.addConstraint("plot_census", {
      fields: ["forestCensusId"],
      type: "foreign key",
      references: {
        table: "forest_census",
        field: "id",
      },
      onDelete: "cascade",
    });
    await queryInterface.removeConstraint(
      "plot_census",
      "plot_census_plotId_fkey"
    );
    await queryInterface.addConstraint("plot_census", {
      fields: ["plotId"],
      type: "foreign key",
      references: {
        table: "plots",
        field: "id",
      },
      onDelete: "cascade",
    });
    await queryInterface.removeConstraint("plots", "plots_forestId_fkey");
    await queryInterface.addConstraint("plots", {
      fields: ["forestId"],
      type: "foreign key",
      references: {
        table: "forests",
        field: "id",
      },
      onDelete: "cascade",
    });
    await queryInterface.removeConstraint(
      "tree_census",
      "tree_census_plotCensusId_fkey"
    );
    await queryInterface.addConstraint("tree_census", {
      fields: ["plotCensusId"],
      type: "foreign key",
      references: {
        table: "plot_census",
        field: "id",
      },
      onDelete: "cascade",
    });
    await queryInterface.removeConstraint(
      "tree_census",
      "tree_census_treeId_fkey"
    );
    await queryInterface.addConstraint("tree_census", {
      fields: ["treeId"],
      type: "foreign key",
      references: {
        table: "trees",
        field: "id",
      },
      onDelete: "cascade",
    });
    await queryInterface.removeConstraint("trees", "trees_plotId_fkey");
    await queryInterface.addConstraint("trees", {
      fields: ["plotId"],
      type: "foreign key",
      references: {
        table: "plots",
        field: "id",
      },
      onDelete: "cascade",
    });
    await queryInterface.removeConstraint("trees", "trees_initCensusId_fkey");
    await queryInterface.addConstraint("trees", {
      fields: ["initCensusId"],
      type: "foreign key",
      references: {
        table: "tree_census",
        field: "id",
      },
      onDelete: "cascade",
    });
    await queryInterface.removeConstraint(
      "plot_census_assignment",
      "plot_census_assignment_plotCensusId_fkey"
    );
    await queryInterface.addConstraint("plot_census_assignment", {
      fields: ["plotCensusId"],
      type: "foreign key",
      references: {
        table: "plot_census",
        field: "id",
      },
      onDelete: "cascade",
    });
    await queryInterface.removeConstraint(
      "plot_census_assignment",
      "plot_census_assignment_userId_fkey"
    );
    await queryInterface.addConstraint("plot_census_assignment", {
      fields: ["userId"],
      type: "foreign key",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "forest_census",
      "forest_census_forestId_forests_fk"
    );
    await queryInterface.addConstraint("forest_census", {
      fields: ["forestId"],
      type: "foreign key",
      name: "forest_census_forestId_fkey",
      references: {
        table: "forests",
        field: "id",
      },
    });
    await queryInterface.removeConstraint(
      "plot_census",
      "plot_census_forestCensusId_forest_census_fk"
    );
    await queryInterface.addConstraint("plot_census", {
      fields: ["forestCensusId"],
      type: "foreign key",
      name: "plot_census_forestCensusId_fkey",
      references: {
        table: "forest_census",
        field: "id",
      },
    });
    await queryInterface.removeConstraint(
      "plot_census",
      "plot_census_plotId_plots_fk"
    );
    await queryInterface.addConstraint("plot_census", {
      fields: ["plotId"],
      type: "foreign key",
      name: "plot_census_plotId_fkey",
      references: {
        table: "plots",
        field: "id",
      },
    });
    await queryInterface.removeConstraint("plots", "plots_forestId_forests_fk");
    await queryInterface.addConstraint("plots", {
      fields: ["forestId"],
      type: "foreign key",
      name: "plots_forestId_fkey",
      references: {
        table: "forests",
        field: "id",
      },
    });
    await queryInterface.removeConstraint(
      "tree_census",
      "tree_census_plotCensusId_plot_census_fk"
    );
    await queryInterface.addConstraint("tree_census", {
      fields: ["plotCensusId"],
      type: "foreign key",
      name: "tree_census_plotCensusId_fkey",
      references: {
        table: "plot_census",
        field: "id",
      },
    });
    await queryInterface.removeConstraint(
      "tree_census",
      "tree_census_treeId_trees_fk"
    );
    await queryInterface.addConstraint("tree_census", {
      fields: ["treeId"],
      type: "foreign key",
      name: "tree_census_treeId_fkey",
      references: {
        table: "trees",
        field: "id",
      },
    });
    await queryInterface.removeConstraint("trees", "trees_plotId_plots_fk");
    await queryInterface.addConstraint("trees", {
      fields: ["plotId"],
      type: "foreign key",
      name: "trees_plotId_fkey",
      references: {
        table: "plots",
        field: "id",
      },
    });
    await queryInterface.removeConstraint(
      "trees",
      "trees_initCensusId_tree_census_fk"
    );
    await queryInterface.addConstraint("trees", {
      fields: ["initCensusId"],
      type: "foreign key",
      name: "trees_initCensusId_fkey",
      references: {
        table: "tree_census",
        field: "id",
      },
      onDelete: "SET NULL",
    });
    await queryInterface.removeConstraint(
      "plot_census_assignment",
      "plot_census_assignment_plotCensusId_plot_census_fk"
    );
    await queryInterface.addConstraint("plot_census_assignment", {
      fields: ["plotCensusId"],
      type: "foreign key",
      name: "plot_census_assignment_plotCensusId_fkey",
      references: {
        table: "plot_census",
        field: "id",
      },
    });
    await queryInterface.removeConstraint(
      "plot_census_assignment",
      "plot_census_assignment_userId_users_fk"
    );
    await queryInterface.addConstraint("plot_census_assignment", {
      fields: ["userId"],
      type: "foreign key",
      name: "plot_census_assignment_userId_fkey",
      references: {
        table: "users",
        field: "id",
      },
    });
  },
};
