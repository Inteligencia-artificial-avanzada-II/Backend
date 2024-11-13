import { Model, Sequelize } from "sequelize";

interface PuertaContenedorAttributes {
  idPuertaContenedor: number;
  idPuerta: number;
  idContenedor: number;
  fecha: Date;
}

module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class PuertaContenedor
    extends Model<PuertaContenedorAttributes>
    implements PuertaContenedorAttributes
  {
    public idPuertaContenedor!: number;
    public idPuerta!: number;
    public idContenedor!: number;
    public fecha!: Date;

    static associate(models: any) {
      PuertaContenedor.belongsTo(models.Puerta, {
        foreignKey: "idPuerta",
      });
      PuertaContenedor.belongsTo(models.Contenedor, {
        foreignKey: "idContenedor",
      });
    }
  }

  PuertaContenedor.init(
    {
      idPuertaContenedor: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      idPuerta: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idContenedor: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "PuertaContenedor",
    }
  );
  return PuertaContenedor;
};
