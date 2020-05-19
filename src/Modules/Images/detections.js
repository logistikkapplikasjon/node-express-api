//import tf from '@tensorflow/tfjs-node';
//import toUint8Array from 'base64-to-uint8array';
//import { cocossd } from './cocossd';

/**
 * Image modules for image endpoints
 */
const toUint8Array = require('base64-to-uint8array');
const cocossd = require('./cocossd');
const tf = require('@tensorflow/tfjs-node');

/**
 * Asynchronous function for making predictions on images. Takes in imagedata as an object containing Base64-encoded image.
 * Feeds the data to the prediction model and returns an array of predictions consisting of class name, prediction score, bound boxes of the object.
 * @param {Request} req Request from client.
 * @param {Response} res Response sent to client.
 */
const imageDetections = async (req, res) => {
  try {
    const imageData = req.body.imageData
      .replace('data:image/jpeg;base64', '')
      .replace('data:image/png;base64', '');
    const imageArray = toUint8Array(imageData);
    const tensor3d = tf.node.decodeJpeg(imageArray, 3);
    const model = await cocossd.load({
      base: 'mobilenet_v2',
    });
    const predictions = await model.detect(tensor3d);

    return res.status(200).json(predictions);
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports = { imageDetections };
