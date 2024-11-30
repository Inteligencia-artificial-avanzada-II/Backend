'use strict';

/** 
  * Migración para añadir y eliminar la columna "rental" en la tabla "Contenedor".
  * 
  * @type {import('sequelize-cli').Migration}
*/
module.exports = {
  /**
    * Función que se ejecuta cuando se aplica la migración.
    * Añade una nueva columna llamada "rental" de tipo BOOLEAN a la tabla "Contenedor".
    * 
    * @param {object} queryInterface - Interfaz para realizar consultas en la base de datos.
    * @param {object} Sequelize - Objeto Sequelize para definir tipos de datos y utilidades.
    * @returns {Promise<void>} - Promesa que indica la finalización de la migración.
  */
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Contenedor', 'rental', {
      type: Sequelize.BOOLEAN, // Define el tipo de dato como BOOLEAN.
      allowNull: false, // No permite valores nulos.
      defaultValue: false, // Establece un valor por defecto de "false".
    });
  },

  /**
    * Función que se ejecuta cuando se revierte la migración.
    * Elimina la columna "rental" de la tabla "Contenedor".
    * 
    * @param {object} queryInterface - Interfaz para realizar consultas en la base de datos.
    * @param {object} Sequelize - Objeto Sequelize para definir tipos de datos y utilidades.
    * @returns {Promise<void>} - Promesa que indica la finalización de la reversión.
  */
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Contenedor', 'rental');
  }
};
