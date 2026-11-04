import Config from "react-native-config";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const api_url = Config.API_URL;

export const connectSocket = (accountId: number) => {
    socket = io(`${api_url}/charts`, {
        transports: ["websocket"],
        auth: {
            accountId,
        },
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });

    return socket;
};

export const getSocket = () => socket;