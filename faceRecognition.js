import faceapi from "face-api.js";

import { canvas } from "./canvas.js";
import { faceDetectionOptions, faceDetectionNet } from "./faceDetection.js";
import { saveFile, download } from "./saveFile.js";

//"https://api.tinify.com/output/fqrda3484ym3b7ghwc2neujnzmt6a8gy","https://api.tinify.com/output/f2j6y3cgk009dewfp55713xgta4cbnuv","https://api.tinify.com/output/ekdntqh6zfwt4uy39rjvmy4564jtnd8w"
const REFERENCE_IMAGE ="https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/Thor/2.jpg";

let arrayOfObj = [
  {
    img:
      "https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/Hawkeye/1.jpg",
    verified: false,
    adult: false,
  },
  {
    img:
      "https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/Thor/2.jpg",
    verified: false,
    adult: false,
  },
  {
    img:
      "https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/Hawkeye/1.jpg",
    verified: false,
    adult: false,
  },
];

//const QUERY_IMAGE = 'https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/Thor/1.jpg'
//const QUERY_IMAGE = './widow/1.jpg'

await faceDetectionNet.loadFromDisk("./models");
await faceapi.nets.faceLandmark68Net.loadFromDisk("./models");
await faceapi.nets.faceRecognitionNet.loadFromDisk("./models");

async function run(obj, REFERENCE_IMAGE) {
   let QUERY_IMAGE = obj["img"];
  const referenceImage = await canvas.loadImage(REFERENCE_IMAGE);
  const queryImage = await canvas.loadImage(QUERY_IMAGE);

  // detect faces
  const resultsRef = await faceapi
    .detectAllFaces(referenceImage, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptors();

  const resultsQuery = await faceapi
    .detectAllFaces(queryImage, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptors();

  const faceMatcher = new faceapi.FaceMatcher(resultsRef, 0.55);
 
  const labels = faceMatcher.labeledDescriptors.map((ld) => ld.label);
 
  const refDrawBoxes = resultsRef
    .map((res) => res.detection.box)
    .map((box, i) => new faceapi.draw.DrawBox(box, { label: labels[i] }));
  const outRef = faceapi.createCanvasFromMedia(referenceImage);

  refDrawBoxes.forEach((drawBox) => drawBox.draw(outRef));
  saveFile("referenceImage.jpg", outRef.toBuffer("image/jpeg"));

  console.log({resultsQuery})

  resultsQuery.map((res) => {
    const bestMatch = faceMatcher.findBestMatch(res.descriptor);
    if (bestMatch._label === "person 1") {
      obj["verified"] = true;
    }
    return obj
  });
}

const runLoop = async (arrayOfObj, REFERENCE_IMAGE) => {
  for (let i = 0; i < arrayOfObj.length; i++) {
    let obj = arrayOfObj[i];
    obj = await run(obj, REFERENCE_IMAGE);
  }
   console.log('final to return',arrayOfObj)
};
runLoop(arrayOfObj, REFERENCE_IMAGE);
