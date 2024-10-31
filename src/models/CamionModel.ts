import { Model, Sequelize } from "sequelize";

// Interfaz que define los atributos del modelo Camion
interface CamionAttributes {
  idCamion: number;
  placas: string;
  modelo: string;
  idMongoLocalzacion: string;
  isOccupied: boolean;
}

// Exporta una función que define el modelo Camion
module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class Camion extends Model<CamionAttributes> implements CamionAttributes {
    public idCamion!: number;
    public placas!: string;
    public modelo!: string;
    public idMongoLocalzacion!: string;
    public isOccupied!: boolean;
  }

  Camion.init(
    {
      idCamion: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      placas: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      modelo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      idMongoLocalzacion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isOccupied: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Camion",
    }
  );

  return Camion;
};
