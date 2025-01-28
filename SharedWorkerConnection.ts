export default class SharedWorkerConnection {
  sharedWorker: SharedWorker;
  private interval: number | undefined = undefined;
  isConnected: boolean = false;
  port: MessagePort;

  constructor(workerPath: string) {
    this.sharedWorker = new SharedWorker(workerPath, { type: "module" });
    this.port = this.sharedWorker.port;
    window.addEventListener("unload", () => this.handleUnload());
  }

  start() {
    this.sharedWorker.port.start();
    this.startPing();
    console.log("SharedWorker connection started");
  }

  // disconnect 처리
  private handleUnload() {
    if (this.isConnected) {
      this.sharedWorker.port.postMessage({ type: "$disconnect" });
    }
  }

  // ping 처리
  private startPing() {
    this.interval = setInterval(() => {
      if (this.isConnected) {
        this.sharedWorker.port.postMessage({ type: "$ping" });
      } else {
        this.interval && clearInterval(this.interval);
      }
    }, 5000);
  }

  setMessageHandler(handler: (event: MessageEvent<any>) => any) {
    this.sharedWorker.port.onmessage = (event) => {
      handler(event);

      switch (event.type) {
        case "$connected":
          this.isConnected = true;
          break;
      }
    };
  }
}
