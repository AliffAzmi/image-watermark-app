const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const md5 = require('md5')
const fs = require('fs')
const request = require('request')
const im = require('imagemagick')
const port = 4002

app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyParser.json({limit: '50mb'}))

app.get('/', (req, res) => res.send('This is image watermarking app'))
app.post('/', (req, res) => { do_watermarking(req,res) })

const do_watermarking = async (req, res) => {
	
	// valid image urls in array
	const urls = [
		"https://www.gstatic.com/webp/gallery/4.sm.webp"
	]
	const watermark = 'TEXT HERE'

	let fileInputPath, fileOutputPath

	urls.map(async url => {
		var imgURL = url
		var imgKey = md5(imgURL)
		fileInputPath = `input_${imgKey}.jpg`
		fileOutputPath = `result_${imgKey}.jpg`

		await new Promise(resolve =>
		    request(imgURL)
		      .pipe(fs.createWriteStream(fileInputPath))
		      .on('finish', resolve))

		await convertImg(watermark, fileInputPath, fileOutputPath).then(d => {
			// do something with your output files here
			// return 'OK' since imagemagick convert return nothing
			res.json('OK')
		}).catch(err => {
			res.json(err)
		})
	})

}

const convertImg = (watermark, fileInputPath, fileOutputPath) => {
	return new Promise((resolve, reject) => {
		var args = [
			`${fileInputPath}`,
			"-background", "#0008",
			"-fill", "white",
			"-gravity", "south",
			"-size", "100x25",
			"-pointsize", "15",
			`caption:${watermark}`,
			// "+swap",
			"-gravity", "southeast",
			"-size", "1000x600",
			"-composite",
			`${fileOutputPath}`
		];
		
		try {
			im.convert(args, function(err, stdout){
				if (err){ reject(err) }
				resolve(stdout)
			});			
		} catch (error) {
			reject(error)
		}
	})
}

app.listen(port, () => { console.log(`image-watermark-app listening at ${port}`) })