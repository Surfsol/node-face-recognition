const faceapi = require("face-api.js");
const { canvas } = require("./canvas.js");
const { faceDetectionOptions } = require("./faceDetection.js");
const { faceDetectionNet } = require("./faceDetection.js");
const express = require("express");

const router = express.Router();

const arrayOfObj = [
  {
    img:
      "http://res.cloudinary.com/siingly/image/upload/q_auto:eco/v1617847031/237ff04c3af706347dbad05c58dec184.png",
    selfie: 1,
    verified: 1,
  },
  {
    adult: 0,
    img:
      "http://res.cloudinary.com/siingly/image/upload/q_auto:eco/v1617758703/88b3cbfc6e5a2509bf218687f90c5d5d.png",
    verified: 0,
  },
  {
    adult: 0,
    img:
      "http://res.cloudinary.com/siingly/image/upload/q_auto:eco/v1617758860/768be461b67303a1e67bfafbdc9ef780.png",
    verified: 0,
  },
  {
    adult: 0,
    img:
      "http://res.cloudinary.com/siingly/image/upload/q_auto:eco/v1617892548/dc6ff85305e5d4e454a138810fca2b1b.png",
    verified: 0,
  },
  {
    adult: 0,
    img:
      "http://res.cloudinary.com/siingly/image/upload/q_auto:eco/v1617892660/4aefdc24d47ddfe356ac4ee56d8b8f5b.png",
    verified: 1,
  },
];

async function run(arrayOfObj) {
  await faceDetectionNet.loadFromDisk("./models");
  await faceapi.nets.faceLandmark68Net.loadFromDisk("./models");
  await faceapi.nets.faceRecognitionNet.loadFromDisk("./models");

  const REFERENCE_IMAGE = arrayOfObj[0]["img"];
  for (let i = 0; i < arrayOfObj.length; i++) {
    let QUERY_IMAGE = arrayOfObj[i]["img"];
    const referenceImage = await canvas.loadImage(REFERENCE_IMAGE);
    const queryImage = await canvas.loadImage(QUERY_IMAGE);
    console.log({ referenceImage, queryImage });
    // detect faces
    try {
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

      resultsQuery.map((res) => {
        const bestMatch = faceMatcher.findBestMatch(res.descriptor);
        if (bestMatch._label === "person 1") {
          arrayOfObj[i]["verified"] = true;
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
  return arrayOfObj;
}
run(arrayOfObj);
router.post("/face", async (req, res) => {
  const images = req.body;
  const REFERENCE_IMAGE = images[0]["img"];
  try {
    const newArray = await run(images, REFERENCE_IMAGE);
    if (newArray) {
      res.status(200).json(newArray);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", async (req, res) => {
  res.status(200).json("Welcome to face recognition.");
});
module.exports = router;
