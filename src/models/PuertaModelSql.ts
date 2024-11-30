import { options } from "joi";
import { Model, Sequelize } from "sequelize";
import PuertaController from "../controllers/PuertaController";

interface PuertaAttributes {
  idPuerta: number;
  idCedis: number;
  number: number;
  isOccupied: boolean;
}

// Exporta una función que define el modelo Puerta
module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class Puerta extends Model<PuertaAttributes> implements PuertaAttributes {
    public idPuerta!: number;
    public idCedis!: number;
    public number!: number;
    public isOccupied!: boolean;

    static associate(models: any) {
      Puerta.belongsTo(models.Cedis, {
        foreignKey: "idCedis",
      });
    }
  }

  Puerta.init(
    {
      idPuerta: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      idCedis: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isOccupied: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Puerta",
      hooks: {
        afterUpdate: async (puerta, options) => {
          const puertaControllerInstance = PuertaController.instance; 
          // Detecta cambios en `isOccupied` y verifica si es false
          if (puerta.changed("isOccupied") && puerta.isOccupied === false) {
            console.log(`Cambio detectado en Puerta ${puerta.idPuerta}`);
            // Llama al método del controlador pasando el `idPuerta`
            await puertaControllerInstance.puertaDisponible(puerta.idPuerta);
          }
        },
      },
    }
  );
  return Puerta;
};
