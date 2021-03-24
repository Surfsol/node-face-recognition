const faceapi = require("face-api.js");
const { canvas } = require("./canvas.js");
const { faceDetectionOptions } = require("./faceDetection.js");
const { faceDetectionNet } = require("./faceDetection.js");
const { saveFile } = require("./saveFile.js");
const { download } = require("./saveFile.js");
const express = require("express");

const router = express.Router();

//"https://api.tinify.com/output/fqrda3484ym3b7ghwc2neujnzmt6a8gy","https://api.tinify.com/output/f2j6y3cgk009dewfp55713xgta4cbnuv","https://api.tinify.com/output/ekdntqh6zfwt4uy39rjvmy4564jtnd8w"
// const REFERENCE_IMAGE =
//   "https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/Thor/2.jpg";

// let arrayOfObj = [
//   {
//     img:
//       "https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/Hawkeye/1.jpg",
//     verified: false,
//     adult: false,
//   },
//   {
//     img:
//       "https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/Thor/2.jpg",
//     verified: false,
//     adult: false,
//   },
//   {
//     img:
//       "https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/Hawkeye/1.jpg",
//     verified: false,
//     adult: false,
//   },
// ];


async function run(arrayOfObj, REFERENCE_IMAGE) {
  await faceDetectionNet.loadFromDisk("./models");
  await faceapi.nets.faceLandmark68Net.loadFromDisk("./models");
  await faceapi.nets.faceRecognitionNet.loadFromDisk("./models");

  for (let i = 0; i < arrayOfObj.length; i++) {
    let QUERY_IMAGE = arrayOfObj[i]["img"];
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

    console.log({ resultsQuery });

    resultsQuery.map((res) => {
      const bestMatch = faceMatcher.findBestMatch(res.descriptor);
      if (bestMatch._label === "person 1") {
        arrayOfObj[i]["verified"] = true;
      }
    });
  }
  return arrayOfObj;
}

router.post("/face", async (req, res) => {
  const images = req.body;
  console.log("router", images);
  const REFERENCE_IMAGE = images[0]["img"];
  try {
    // const newArray = await runFaceLoop(images)
    console.log("in try");
    const newArray = await run(images, REFERENCE_IMAGE);
    console.log({ newArray });
    if (newArray) {
      console.log("in new array", newArray);
      res.status(200).json(newArray);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
