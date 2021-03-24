// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
const tensorflow = require("@tensorflow/tfjs-node");

const faceapi = require("face-api.js");

console.log("env", faceapi.env.monkeyPatch);

// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
//const canvas = require('canvas')
const canvas = require("canvas");

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

module.exports = { canvas };
