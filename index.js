import SharedWorkerConnection from "./SharedWorkerConnection.js";

const catButton = document.getElementById("cat-button");
const dogButton = document.getElementById("dog-button");
const ul = document.getElementById("photo-list");

const sharedWorker = new SharedWorkerConnection("./sharedWorker.js");
sharedWorker.start();

catButton.addEventListener("click", () => {
  if (sharedWorker.isConnected) {
    sharedWorker.port.postMessage({ type: "request", animal: "cat" });
  }
});

dogButton.addEventListener("click", () => {
  if (sharedWorker.isConnected) {
    sharedWorker.port.postMessage({ type: "request", animal: "dog" });
  }
});

sharedWorker.setMessageHandler((event) => {
  const { type, data } = event.data;

  switch (type) {
    case "connected":
      if (Array.isArray(data)) {
        data.forEach(addPhotoToList);
      }
      break;

    case "newImage":
      addPhotoToList(data);
      break;
  }
});

function addPhotoToList(photoUrl) {
  const li = document.createElement("li");
  const image = document.createElement("img");
  image.src = photoUrl;
  li.appendChild(image);
  ul.appendChild(li);
}
