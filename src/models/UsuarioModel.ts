import { Model, Sequelize } from "sequelize";
import bcrypt from "bcrypt";

// Interfaz que define los atributos del modelo Usuario
interface UsuarioAttributes {
  idUsuario: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  userName: string;
  contraseña: string;
  rol: string;
}

// Exporta una función que define el modelo Usuario
module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class Usuario extends Model<UsuarioAttributes> implements UsuarioAttributes {
    public idUsuario!: number;
    public nombre!: string;
    public apellidoPaterno!: string;
    public apellidoMaterno!: string;
    public userName!: string;
    public contraseña!: string;
    public rol!: string;

    // Método para comparar la contraseña ingresada con el hash almacenado
    public async validatePassword(contraseña: string): Promise<boolean> {
      return bcrypt.compare(contraseña, this.contraseña);
    }
  }

  Usuario.init(
    {
      idUsuario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apellidoPaterno: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apellidoMaterno: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contraseña: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rol: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Usuario",
      hooks: {
        beforeCreate: async (usuario: Usuario) => {
          const salt = await bcrypt.genSalt(10);
          usuario.contraseña = await bcrypt.hash(usuario.contraseña, salt);
        },
        beforeUpdate: async (usuario: Usuario) => {
          if (usuario.changed("contraseña")) {
            const salt = await bcrypt.genSalt(10);
            usuario.contraseña = await bcrypt.hash(usuario.contraseña, salt);
          }
        },
      },
    }
  );

  return Usuario;
};
