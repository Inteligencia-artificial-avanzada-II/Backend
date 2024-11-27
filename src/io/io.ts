import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketIOServer | null = null;

// Mapa para almacenar la relación entre ID único y socket ID
const clients = new Map<string, string>();
const frontendAdmins = new Set<string>();


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
            if (uniqueId === "frontend-admin") {
                frontendAdmins.add(socket.id); // Registrar en el Set de frontend-admin
                console.log("Frontend-admin registrado:", socket.id);
            } else {
                clients.set(uniqueId, socket.id); // Registrar en el Map de clientes estándar
                console.log("Cliente registrado en el mapa de clientes:", uniqueId, socket.id);
            }

            console.log("Estado actual del mapa de clientes:", clients);
            console.log("Estado actual de los frontend-admins:", frontendAdmins);
        });

        // Escuchar eventos de mensaje desde el cliente
        socket.on("mensaje", (data) => {
            console.log("Mensaje recibido del cliente:", data);
        });

        // Manejar desconexiones
        socket.on("disconnect", () => {
            console.log("Cliente desconectado:", socket.id);

            // Eliminar del mapa de clientes
            for (const [key, value] of clients.entries()) {
                if (value === socket.id) {
                    clients.delete(key);
                    console.log(`Cliente con ID único ${key} eliminado del registro.`);
                    break;
                }
            }

            // Eliminar del Set de frontend-admin
            if (frontendAdmins.has(socket.id)) {
                frontendAdmins.delete(socket.id);
                console.log(`Frontend-admin con socket ID ${socket.id} eliminado.`);
            }

            console.log("Estado actual del mapa de clientes:", clients);
            console.log("Estado actual de los frontend-admins:", frontendAdmins);
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

export function getFrontendAdmins(): Set<string> {
    return frontendAdmins;
}