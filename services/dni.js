const tesseract = require('node-tesseract-ocr');
const parse = require('mrz').parse;
const Jimp = require('jimp');
const path = require('path');

//PATH IMAGE
const imagePath = path.join(__dirname, '../images/');
class DniService {
    constructor() {}
    async getData({ type }) {
        await this.preprocessImage();
        let TextFromTesseract = await this.recognizeImage(`${imagePath}/identificationG.jpg`);
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
        userData.fields.firstName = userData.fields.firstName.split(' ')[0];
        return userData.fields;
    }
    async recognizeImage(image) {
        const config = {
            lang: 'eng',
            oem: 1,
            psm: 3,
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\\<0123456789',
        };
        try {
            let data = await tesseract.recognize(image, config);
            return data;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error recognizing image:', error);
            return error;
        }
    }
    async preprocessImage() {
        const image = await Jimp.read(`${imagePath}identification.jpg`);
        image
            .resize(Jimp.AUTO, 1000)
            .contrast(0.5)
            .brightness(0.2)
            .normalize()
            .gaussian(1)
            .greyscale()
            .invert()
            .write(`${imagePath}identificationG.jpg`);
    }
}

module.exports = DniService;
