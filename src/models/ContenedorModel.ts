import { Model, Sequelize } from "sequelize";

// Interfaz que define los atributos del modelo Contenedor
interface ContenedorAttributes {
  idContenedor: number;
  capacidad: number;
}

// Exporta una función que define el modelo Contenedor
module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class Contenedor
    extends Model<ContenedorAttributes>
    implements ContenedorAttributes
  {
    public idContenedor!: number;
    public capacidad!: number;
  }

  Contenedor.init(
    {
      idContenedor: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      capacidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Contenedor",
    }
  );

  return Contenedor;
};
