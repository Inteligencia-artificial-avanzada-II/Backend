"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Orden", "localization", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "No especificado",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Orden", "localization");
  },
};
