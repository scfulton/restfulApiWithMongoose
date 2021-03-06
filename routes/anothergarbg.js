const express = require("express");
const router = express.Router();
const Image = require("../models/Images.js");
const Jimp = require("jimp");
const fs = require("fs");
const FileBase = require("react-file-base64");
const spawn = require("child_process").spawn;

// get one
router.get("/findOne/:companyName", async (req, res) => {
    const cname = req.params.companyName;
    console.log(cname);

    const imagePull = await Image.findOne({
        companyName: cname
    });
    try {
        res.contentType("json");
        res.status(200).send(imagePull);
    } catch (error) {
        res.status(500).send(error);
    }
});

//get all
router.get("/", async (req, res) => {
    console.log("in it");
    const imagePull = await Image.find({});
    try {
        res.status(200).send(imagePull);
    } catch (error) {
        res.status(500).send(error);
    }
});

//post one
router.post("/uploadbase", async (req, res, next) => {
    const cname = req.body.companyName;
    const datum = req.body.imageBase64;
    // let base64Datum;
    // const newImage = new Image({
    //     companyName: req.body.companyName,
    //     imageBase64: req.body.imageBase64
    // });

    // let base64Datum;
    // console.log("in getData");

    // const promise1 = new Promise(function(resolve) {
    //     setTimeout(function() {
    //         resolve();
    //     }, 1000);
    // });

    // async () => {
    //     const returnVal = await promise1;
    // };

    const base64Datum = await datum.replace(/^data:image\/png;base64,/, "");
    fs.writeFile("out.png", base64Datum, "base64", function(err) {
        if (err) {
            console.error(err);
        }
        console.log("data cleaned");
    });

    // await cb(pyProgIt);

    // console.log("in jimpIt"),
    // () => {
    await Jimp.read("out.png", async (err, image) => {
        if (err) {
            throw err;
        }

        var w = image.bitmap.width;
        var h = image.bitmap.height;
        var wMh = w - h;
        var tenPer = h * 0.1;
        console.log("tenPer: wMh ", tenPer, wMh);

        if (wMh < tenPer) {
            //then it's ~ a square
            console.log("its a square");
            image
                .resize(128, 128) // resize
                .quality(100) // set JPEG quality
                // .greyscale() // set greyscale
                // .invert()
                .write("smallerImg.png"); // save
        } else {
            console.log("it's not a square");
            image
                .resize(128, 79) // resize
                .quality(100) // set JPEG quality
                // .greyscale() // set greyscale
                // .invert()
                .write("smallerImg.png"); // save
        }
        return Promise.resolve();
    })
        .then((err, _null) => {
            console.log("py'ing this");

            spawn("python", ["./pillow.py", "smallerImg.png"]).catch(err);
            return Promise.resolve();
        })
        .then((err, _null) => {
            console.log("reading encoded");

            fs.readFile("encodedTxt.txt", (err, data) => {
                if (err) {
                    throw err;
                }
                data = "data:image/png;base64," + data;
                return data;
            }).catch(err);
            return Promise.resolve();
        })
        .then((err, data) => {
            const bNewImage = new Image(
                {
                    companyName: cname,
                    imageBase64: data
                    // }.then(bNewImage.save())
                }.then(() => {
                    console.log("saving");

                    bNewImage.save();
                })
            ).catch(err);
            return Promise.resolve();
        })
        //
        .then((err, result) => {
            res.status(200)
                .json({
                    success: true,
                    document: result
                })
                .catch(err);
            return Promise.resolve();
        });

    /////////////saves to mongo//////////////
    // });

    // );
    // };
    // await pyProgIt();

    // console.log("in pyProgIt");

    // console.log("spawned");

    // await getDataClean(datum, jimpIt).then(
    //     console.log("about to write"),

    // );
});

// async function getDataClean(data, cb) {
//     let base64Datum;
//     // console.log("in getData");
//     base64Datum = await data.replace(/^data:image\/png;base64,/, "").then(
//         fs.writeFile("out.png", base64Datum, "base64", function(err) {
//             if (err) {
//                 console.error(err);
//             }
//             console.log("data cleaned");
//         })
//     );
//     await cb(pyProgIt);

//     // var promise = new Promise((resolve, reject) => {
// }

// async function jimpIt(cb) {
//     console.log("in jimpIt"),
//         () => {
//             Jimp.read("out.png", (err, image) => {
//                 if (err) {
//                     throw err;
//                 }

//                 var w = image.bitmap.width;
//                 var h = image.bitmap.height;
//                 var wMh = w - h;
//                 var tenPer = h * 0.1;
//                 console.log("tenPer: wMh ", tenPer, wMh);

//                 if (wMh < tenPer) {
//                     //then it's ~ a square
//                     console.log("its a square");
//                     image
//                         .resize(128, 128) // resize
//                         .quality(100) // set JPEG quality
//                         // .greyscale() // set greyscale
//                         // .invert()
//                         .write("smallerImg.png"); // save
//                 } else {
//                     console.log("it's not a square");
//                     image
//                         .resize(128, 79) // resize
//                         .quality(100) // set JPEG quality
//                         // .greyscale() // set greyscale
//                         // .invert()
//                         .write("smallerImg.png"); // save
//                 }
//             });
//         },
//         await pyProgIt();
//     // var promise = new Promise((resolve, reject) => {
// }

// async function pyProgIt() {
//     console.log("in pyProgIt");
//     const spawn = require("child_process").spawn;
//     var pyProcess = spawn("python", ["./pillow.py", "./smallerImg.png"]);
//     console.log("spawned");
// }

module.exports = router;
