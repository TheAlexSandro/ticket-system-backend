import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: process.env["FRONTEND_URL"]?.split(","),
    methods: ["GET", "POST"],
    credentials: true,
  },
})
export class AdminGateway {
  @WebSocketServer()
  server: Server;

  sendCameraStatus(status: boolean) {
    this.server.emit("camera_status", { status });
  }

  logoutCamera() {
    this.server.emit("logout", { status: true });
  }

  refresh() {
    this.server.emit("refresh", { status: true });
  }
}
