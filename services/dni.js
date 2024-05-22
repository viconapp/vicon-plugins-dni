const tesseract = require('node-tesseract-ocr');
const parse = require('mrz').parse;
const Jimp = require('jimp');
const path = require('path');

//PATH IMAGE
const imagePath = path.join(__dirname, '../images/');
class DniService {
    constructor() {}
    async getData({ type }) {
        await this.greyConvert();
        let TextFromTesseract = await this.recognizeImage(`${imagePath}identificationG.jpg`);
        console.log(TextFromTesseract);
        let longitudArray = [],
            message = [],
            data = [];
        switch (type) {
            case 'passport':
                message = TextFromTesseract.split('\n');
                message = message.map((data) => {
                    let item = data.replace(/\n|\r|\s|/g, '');
                    item = item.replace(/[a-z]/g, '<');
                    return item;
                });
                data = message.filter((item) => item.length >= 43 && item.length <= 48);
                longitudArray = data.map((info) => {
                    let item = info.substring(0, 44);
                    return item;
                });
                break;

            case 'ine':
                message = TextFromTesseract.split('\n');
                message = message.map((data) => {
                    let item = data.replace(/\n|\r|\s|/g, '');
                    item = item.replace(/\//gi, '');
                    item = item.replace(/_/gi, '');
                    item = item.replace(/[!"#$%&'`()‘*+,\-./:;=?@{|}]/gi, '');
                    return item;
                });
                longitudArray = message.filter((item) => item.length >= 20 && item.length <= 30);
                break;

            default:
                break;
        }
        let userData = parse(longitudArray);
        return userData.fields;
    }
    recognizeImage(image) {
        const config = {
            lang: 'eng',
            oem: 1,
            psm: 3,
        };
        try {
            const data = tesseract.recognize(image, config);
            return data;
        } catch (error) {
            // eslint-disable-next-line no-console
            return error;
        }
    }
    greyConvert() {
        return new Promise((resolve, reject) => {
            Jimp.read(`${imagePath}/identification.jpg`, (err, image) => {
                if (err) {
                    reject(err);
                }
                image.brightness(-0.2);
                image.contrast(0.3);
                image.greyscale().write(`${imagePath}/identificationG.jpg`);
                resolve();
            });
        });
    }
}

module.exports = DniService;
