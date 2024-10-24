import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import { ConfigFileAuthenticationDetailsProvider } from "oci-common";
import { ObjectStorageClient, requests } from "oci-objectstorage";

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

  private namespace = "axnhu2vnql31";
  private bucketName = "qrprueba";
  private objectName = "image4.png";
  private filePath = path.resolve(
    "/Users/marcocm/Desktop/03_ESCUELA/02_Universidad/07/RetoII/App/assets/bimboLogo.png"
  );

  protected initializeRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
    this.router.post("/crear", this.postCrear.bind(this));
    this.router.post("/subir", this.postSubir.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).send("Qr Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el Qr ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const { text } = req.body; // Recibir el texto del cuerpo del request

      if (!text) {
        return res
          .status(400)
          .send("El cuerpo de la petición debe contener 'text'.");
      }

      // Generar el código QR en base64
      const qrCode = await QRCode.toDataURL(text);

      // Enviar el código QR como respuesta
      res.status(200).send(`<img src="${qrCode}" alt="Código QR" />`);
    } catch (error) {
      console.error("Error al generar el código QR:", error);
      res.status(500).send("Error al generar el código QR.");
    }
  }

  private async postSubir(req: Request, res: Response) {
    try {
      const image = fs.readFileSync(this.filePath);
      const putObjectRequest = {
        bucketName: this.bucketName,
        namespaceName: this.namespace,
        objectName: this.objectName,
        putObjectBody: image,
        contentLength: image.length,
      };
      const putObject = await this.client.putObject(putObjectRequest);
      console.log(putObject);
      res.status(200).send("Imagen subida");
    } catch (error) {
      console.log(error);
    }
  }
}
export default QrController;
