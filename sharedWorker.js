import CleanableSharedWorkerBase from "./CleanableSharedWorkerBase.js";

const imageArray = [];

const workerBase = new CleanableSharedWorkerBase();

self.onconnect = function (event) {
  const [port, id] = workerBase.onConnect(event);

  port.postMessage({ type: "connected", data: imageArray });

  port.onmessage = async (e) => {
    const { animal } = e.data;

    workerBase.onMessage(port, id, e);

    handleRequest(animal);
  };
};

async function handleRequest(animal) {
  const requestUrl = animal === "dog" ? "https://dog.ceo/api/breeds/image/random" : "https://cataas.com/cat?json=true";

  try {
    const response = await fetch(requestUrl);
    const data = await response.json();

    const imageUrl = animal === "dog" ? data.message : `https://cataas.com/cat/${data._id}`;
    imageArray.push(imageUrl);

    workerBase.broadcastData({ type: "newImage", data: imageUrl });
  } catch (error) {
    console.error("Error fetching image:", error);
  }
}
