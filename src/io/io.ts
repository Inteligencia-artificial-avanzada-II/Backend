import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketIOServer | null = null;

// Mapa para almacenar la relación entre ID único y socket ID
const clients = new Map<string, string>();


export function initIo(server: HttpServer): void {
    /**
    * Inicializa Socket.IO con el servidor HTTP.
    * @param server Servidor HTTP donde se montará Socket.IO
    */
    io = new SocketIOServer(server, {
        cors: {
            origin: "*", // Permitir todas las conexiones
            methods: ["GET", "POST"],
        },
        pingInterval: 25000, // Intervalo entre pings
        pingTimeout: 60000, // Tiempo antes de desconectar por inactividad
    });

    // Configuración de eventos de conexión
    io.on("connection", (socket) => {
        console.log("Cliente conectado:", socket.id);

        // Emitir mensaje de bienvenida
        socket.emit("bienvenida", { mensaje: "Conexión exitosa con el servidor" });

        // Escuchar evento para registrar un cliente con su ID único
        socket.on("register", (uniqueId: string) => {
            console.log(`Registro del cliente con ID único: ${uniqueId}`);
            clients.set(uniqueId, socket.id);
            console.log(clients)
        });

        // Escuchar eventos de mensaje desde el cliente
        socket.on("mensaje", (data) => {
            console.log("Mensaje recibido del cliente:", data);
        });

        // Manejar desconexiones
        socket.on("disconnect", () => {
            console.log("Cliente desconectado:", socket.id);

            // Eliminar el cliente del mapa al desconectarse
            for (const [key, value] of clients.entries()) {
                if (value === socket.id) {
                    clients.delete(key);
                    console.log(`Cliente con ID único ${key} eliminado del registro.`);
                    break;
                }
            }
            console.log(clients)
        });
    });
}


export function getIo(): SocketIOServer {
    /**
    * Obtiene la instancia de Socket.IO
    * @returns La instancia de Socket.IO
    */
    if (!io) {
        throw new Error("Socket.IO no está inicializado. Llama a initIo primero.");
    }
    return io;
}

export function getClients(): Map<string, string> {
    /**
    * Devuelve el mapa de clientes registrados.
    * @returns Mapa de clientes (ID único -> socket ID)
    */
    return clients;
}
