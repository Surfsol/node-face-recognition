import faceapi from 'face-api.js';

import {canvas} from './canvas.js'
import {faceDetectionOptions, faceDetectionNet} from './faceDetection.js'
import {saveFile, download} from './saveFile.js'

//"https://api.tinify.com/output/fqrda3484ym3b7ghwc2neujnzmt6a8gy","https://api.tinify.com/output/f2j6y3cgk009dewfp55713xgta4cbnuv","https://api.tinify.com/output/ekdntqh6zfwt4uy39rjvmy4564jtnd8w"
const REFERENCE_IMAGE = 'https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/Hawkeye/1.jpg'

// const urlImg = "https://api.tinify.com/output/fqrda3484ym3b7ghwc2neujnzmt6a8gy"
// download(urlImg)

// const REFERENCE_IMAGE = './selfie'

// saveFile('selfie.jpg', (urlImg).toBuffer('image/jpeg'))

//const REFERENCE_IMAGE = './out/selfie.jpg'

const QUERY_IMAGE = 'https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/Hawkeye/1.jpg'
//const QUERY_IMAGE = './widow/1.jpg'
async function run() {
  await faceDetectionNet.loadFromDisk('./models')
  await faceapi.nets.faceLandmark68Net.loadFromDisk('./models')
  await faceapi.nets.faceRecognitionNet.loadFromDisk('./models')

  // put image on canvas
 
  const referenceImage = await canvas.loadImage(REFERENCE_IMAGE)
  const queryImage = await canvas.loadImage(QUERY_IMAGE)
 
  // detect faces
 console.log('ref img',referenceImage)
  const resultsRef = await faceapi.detectAllFaces(referenceImage, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptors()
  console.log({resultsRef})
  const resultsQuery = await faceapi.detectAllFaces(queryImage, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptors()
  console.log({resultsQuery})
  const faceMatcher = new faceapi.FaceMatcher(resultsRef)
 console.log({faceMatcher})
  const labels = faceMatcher.labeledDescriptors
    .map(ld => ld.label)
  const refDrawBoxes = resultsRef
    .map(res => res.detection.box)
    .map((box, i) => new faceapi.draw.DrawBox(box, { label: labels[i] }))
  const outRef = faceapi.createCanvasFromMedia(referenceImage)
  console.log({outRef})
  refDrawBoxes.forEach(drawBox => drawBox.draw(outRef))
  console.log({outRef})
  saveFile('referenceImage.jpg', (outRef).toBuffer('image/jpeg'))

  const queryDrawBoxes = resultsQuery.map(res => {
    const bestMatch = faceMatcher.findBestMatch(res.descriptor)
    return new faceapi.draw.DrawBox(res.detection.box, { label: bestMatch.toString() })
  })
  const outQuery = faceapi.createCanvasFromMedia(queryImage)
  queryDrawBoxes.forEach(drawBox => drawBox.draw(outQuery))
  saveFile('queryImage.jpg', (outQuery).toBuffer('image/jpeg'))
  console.log('done, saved results to out/queryImage.jpg')
}

run()