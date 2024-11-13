import { Model, Sequelize } from "sequelize";

interface PuertaAttributes {
  idPuerta: number;
  idCedis: number;
  number: number;
  isOccupied: boolean;
}

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
    }
  );
  return Puerta;
};
