import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import { ConfigFileAuthenticationDetailsProvider } from "oci-common";
import { ObjectStorageClient, requests } from "oci-objectstorage";
import { BUCKET_NAME, BUCKET_NAMESPACE, QR_KEY } from "../config";

class QrController extends AbstractController {
  private static _instance: QrController;
  public static get instance(): QrController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new QrController("qr");
    return this._instance;
  }

  private provider = new ConfigFileAuthenticationDetailsProvider();
  private client = new ObjectStorageClient({
    authenticationDetailsProvider: this.provider,
  });

  private namespace = BUCKET_NAMESPACE;
  private bucketName = BUCKET_NAME;

  // Método protegido donde añadimos todas nuestras rutas y las ligamos con los métodos generados
  protected initializeRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
    this.router.post("/crear", this.postCrear.bind(this));
    // this.router.post("/subir", this.postSubir.bind(this));
    this.router.post("/crearYSubir", this.postCrearYSubir.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    /**
      * Prueba de conexión con el controlador.
      *
      * @param req - Objeto de solicitud HTTP.
      * @param res - Objeto de respuesta HTTP.
      * @returns Mensaje indicando que la conexión funciona o un mensaje de error.
    */

    try {
      res.status(200).send("Qr Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el Qr ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    /**
      * Genera un código QR a partir de un texto proporcionado y lo guarda como un archivo en el servidor.
      *
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `text` (string en `req.body`): El texto a codificar en el QR.
      * @param res - Objeto de respuesta HTTP.
      * @returns Ruta del archivo QR generado o mensaje de error.
    */

    try {
      const { text } = req.body; // Recibir el texto del cuerpo del request

      if (!text) {
        return res
          .status(400)
          .send("El cuerpo de la petición debe contener 'text'.");
      }

      // Define la ruta para guardar el archivo
      const folderPath = path.join(__dirname, "qr_codes");
      const filePath = path.join(folderPath, `${Date.now()}_qrcode.png`);

      // Crea la carpeta si no existe
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }

      // Genera y guarda el código QR en la ruta especificada
      await QRCode.toFile(filePath, text);

      // Envía una respuesta con la ubicación del archivo guardado
      res.status(200).send(`Código QR generado y guardado en: ${filePath}`);
    } catch (error) {
      console.error("Error al generar el código QR:", error);
      res.status(500).send("Error al generar el código QR.");
    }
  }

  // private async postSubir(req: Request, res: Response) {
  //   try {
  //     const image = fs.readFileSync(this.filePath);
  //     const putObjectRequest = {
  //       bucketName: this.bucketName,
  //       namespaceName: this.namespace,
  //       objectName: this.objectName,
  //       putObjectBody: image,
  //       contentLength: image.length,
  //     };
  //     const putObject = await this.client.putObject(putObjectRequest);
  //     console.log(putObject);
  //     res.status(200).send("Imagen subida");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  private async postCrearYSubir(req: Request, res: Response) {
    /**
      * Genera un código QR a partir de un texto proporcionado, lo guarda en el servidor
      * y lo sube a un bucket de almacenamiento en Oracle Cloud.
      *
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `text` (string en `req.body`): El texto a codificar en el QR.
      * @param res - Objeto de respuesta HTTP.
      * @returns Confirmación de generación y subida o mensaje de error.
    */

    try {
      const { text } = req.body; // Recibir el texto del cuerpo del request

      if (!text) {
        return res
          .status(400)
          .send("El cuerpo de la petición debe contener 'text'.");
      }

      // Define la ruta para guardar el archivo
      const folderPath = path.join(__dirname, "qr_codes");
      const filePath = path.join(folderPath, `${Date.now()}_qrcode.png`);

      // Crea la carpeta si no existe
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }

      // Genera y guarda el código QR en la ruta especificada
      await QRCode.toFile(filePath, text);

      // Lee el archivo de imagen
      const image = fs.readFileSync(filePath);

      // Configuración para la solicitud de subida
      const putObjectRequest = {
        bucketName: this.bucketName,
        namespaceName: this.namespace,
        objectName: `${Date.now()}_qrcode.png`, // Nombre único del objeto en el bucket
        putObjectBody: image,
        contentLength: image.length,
      };

      // Sube el archivo a tu bucket
      const putObject = await this.client.putObject(putObjectRequest);
      console.log(putObject);

      // Envía una respuesta con confirmación
      res
        .status(200)
        .send("Código QR generado, guardado y subido correctamente.");
    } catch (error) {
      console.error("Error al generar o subir el código QR:", error);
      res.status(500).send("Error al generar o subir el código QR.");
    }
  }

  public async postCrearYSubirPublic(text: string, res: Response) {
    /**
      * Genera un código QR como un buffer a partir de un texto proporcionado y lo sube
      * directamente a un bucket de almacenamiento en Oracle Cloud.
      *
      * @param text - El texto que será codificado en el QR.
      * @param res - Objeto de respuesta HTTP (no utilizado en este caso para enviar respuesta directa).
      * @returns `true` si la operación fue exitosa, `false` en caso de error.
    */

    try {

      if (!text) { 
        return true 
      }

      // Genera el código QR como un Buffer
      const qrCodeBuffer = await QRCode.toBuffer(text);

      // Configuración para la solicitud de subida
      const putObjectRequest = {
        bucketName: this.bucketName,
        namespaceName: this.namespace,
        objectName: `${QR_KEY}-${text}.png`, // Nombre único del objeto en el bucket
        putObjectBody: qrCodeBuffer,
        contentLength: qrCodeBuffer.length,
      };

      // Sube el archivo directamente al bucket
      const putObject = await this.client.putObject(putObjectRequest);

      // Envía una respuesta con confirmación
      return true
    } catch (error) {
      return false
    }
  }
}
export default QrController;
