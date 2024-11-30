"use strict";

/** 
  * Migración para añadir y eliminar la columna "localization" en la tabla "Orden".
  * 
  * @type {import('sequelize-cli').Migration}
*/
module.exports = {
  /**
    * Función que se ejecuta cuando se aplica la migración.
    * Añade una nueva columna llamada "localization" de tipo STRING a la tabla "Orden".
    * 
    * @param {object} queryInterface - Interfaz para realizar consultas en la base de datos.
    * @param {object} Sequelize - Objeto Sequelize para definir tipos de datos y utilidades.
    * @returns {Promise<void>} - Promesa que indica la finalización de la migración.
  */
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Orden", "localization", {
      type: Sequelize.STRING, // Define el tipo de dato como STRING.
      allowNull: false, // No permite valores nulos.
      defaultValue: "No especificado", // Establece un valor por defecto de "No especificado".
    });
  },

  /**
    * Función que se ejecuta cuando se revierte la migración.
    * Elimina la columna "localization" de la tabla "Orden".
    * 
    * @param {object} queryInterface - Interfaz para realizar consultas en la base de datos.
    * @param {object} Sequelize - Objeto Sequelize para definir tipos de datos y utilidades.
    * @returns {Promise<void>} - Promesa que indica la finalización de la reversión.
  */
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Orden", "localization");
  },
};
