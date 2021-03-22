  
// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
import '@tensorflow/tfjs-node';

import faceapi from 'face-api.js';

console.log('env', faceapi.env.monkeyPatch)

// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
//const canvas = require('canvas')
import canvas from 'canvas'

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

export { canvas }