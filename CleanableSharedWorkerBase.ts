export default class CleanableSharedWorkerBase {
  private readonly ports = new Map<number, PortConnection>();
  portCounter = 0;

  constructor() {
    setInterval(() => this.cleanupPorts(), 10000);
  }

  onConnect(e: MessageEvent): [MessagePort, number] {
    const port = e.ports[0];
    const id = this.portCounter++;

    const connection = new PortConnection(port, id);
    this.ports.set(id, connection);
    port.postMessage({ type: "$connected" });

    console.log("New port connected:", id);
    console.log("Total ports:", this.ports.size);

    return [port, id];
  }

  onMessage(port: MessagePort, id: number, e: MessageEvent) {
    const { type } = e.data;

    switch (type) {
      case "$ping":
        this.handlePing(id);
        break;
      case "$disconnect":
        this.handleDisconnect(port, id);
        break;
    }
  }

  broadcastData(data: any) {
    for (const [portId, connection] of this.ports.entries()) {
      try {
        connection.port.postMessage(data);
      } catch (error) {
        console.log("Error broadcasting to port:", portId);
        connection.isActive = false;
      }
    }
  }

  private cleanupPorts() {
    console.log("Starting port cleanup...");
    for (const [id, connection] of this.ports.entries()) {
      if (!connection.isActive || connection.isStale()) {
        try {
          connection.port.close();
        } catch (error) {
          console.log("port 닫는 중 에러", error);
        }
        this.ports.delete(id);
        console.log("port 제거:", id);
      }
    }

    console.log("port cleanup end - Active ports:", this.ports.size);
  }

  private handlePing(id: number) {
    const conn = this.ports.get(id);
    if (conn) {
      conn.updatePing();
    }
  }

  private handleDisconnect(port: MessagePort, id: number) {
    if (this.ports.has(id)) {
      try {
        port.close();
      } catch (error) {
        console.log("Error closing port:", error);
      }
      this.ports.delete(id);
      console.log("Port disconnected:", id);
      console.log("Remaining ports:", this.ports.size);
    }
  }
}

class PortConnection {
  lastPing: number;
  isActive: boolean = true;
  constructor(public port: MessagePort, public id: number) {
    this.lastPing = Date.now();
  }

  updatePing() {
    this.lastPing = Date.now();
  }

  isStale() {
    // 15초 이상 핑이 없으면 stale로 간주
    return Date.now() - this.lastPing > 15000;
  }
}
