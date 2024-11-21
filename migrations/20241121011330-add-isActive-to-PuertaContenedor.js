"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("PuertaContenedor", "isActive", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Valor por defecto si es necesario
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("PuertaContenedor", "isActive");
  },
};
