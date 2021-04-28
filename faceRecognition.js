const faceapi = require("face-api.js");
const { canvas } = require("./canvas.js");
const { faceDetectionOptions } = require("./faceDetection.js");
const { faceDetectionNet } = require("./faceDetection.js");
const express = require("express");
const nsfw = require("nsfwjs");
const tf = require("@tensorflow/tfjs-node");
const axios = require("axios");
const router = express.Router();
const path = require("path");
const fs = require("fs");

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

const nude = async (arrayOfObj) => {
  const pathFiles = ".\adult";
  if (!fs.existsSync(pathFiles)) {
    fs.mkdir(pathFiles, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("New directory successfully created.");
      }
    });
  }
  nudeArray = [];
  for (i = 0; i < arrayOfObj.length; i++) {
    let toCheck = arrayOfObj[i]["img"] || arrayOfObj[i]["vid"];
    console.log({ toCheck });
    let splitArray = toCheck.split('/')
    let fileEnd = splitArray[splitArray.length - 1]
    let file = `./adult/${fileEnd}`
    console.log({file})
    fs.writeFile(file, toCheck , function (err) {
      if (err) throw err;    
      console.log('Results Received');
    }); 
    const pic = await axios.get(toCheck, {
      responseType: "arraybuffer",
    });
    console.log('past piccccc');
    // save to file
    //let retrieve = `_dirname ${file}`
    const dirPath = path.join(__dirname, `/${file}`);
    console.log({dirPath})
    const model = await nsfw.load(dirPath); // To load a local model, nsfw.load('file://./path/to/model/')
    // Image must be in tf.tensor3d format
    // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)
    console.log("got modellllllllllllllllll");
    const image = await tf.node.decodeImage(pic.data, 3);
    console.log({ image });
    const predictions = await model.classify(image);
    console.log({ predictions });
    image.dispose(); // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
    nudeArray.push(predictions);
  }
  return nudeArray;
};

async function run(arrayOfObj) {
  //you can use any http client

  const afterNudeArray = await nude(arrayOfObj);

  if (afterNudeArray[0]["selfie"]) {
    await faceDetectionNet.loadFromDisk("./models");
    await faceapi.nets.faceLandmark68Net.loadFromDisk("./models");
    await faceapi.nets.faceRecognitionNet.loadFromDisk("./models");

    const REFERENCE_IMAGE = afterNudeArray[0]["img"];
    for (let i = 0; i < afterNudeArray.length; i++) {
      let QUERY_IMAGE = afterNudeArray[i]["img"];
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

        resultsQuery.map((res) => {
          const bestMatch = faceMatcher.findBestMatch(res.descriptor);
          if (bestMatch._label === "person 1") {
            afterNudeArray[i]["verified"] = true;
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
  return afterNudeArray;
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
