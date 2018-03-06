const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');
const MongoClient = require('mongodb').MongoClient

const sensiboUrl = 'https://home.sensibo.com/api/v2'
const sensiboApiKey = 'Bce6eqopUjCkS8ckvWriv4SfonI7py'

const sensiboAPI = ( path ) => {
	return sensiboUrl + path + '?apiKey=' + sensiboApiKey
}
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

MongoClient.connect('mongodb://smarthome:Pal24Com@ds253918.mlab.com:53918/smarthome-api', (err, client) => {
  if (err) return console.log(err)
  db = client.db('smarthome-api')

	request(sensiboAPI('/users/me/pods'), { json: true }, (err, response, body) => {
	  if (err) { return console.log(err); }
	  console.log(response.statusCode);
	  if (response.statusCode == 200){
	  	if (body.status == "success"){
	  		console.log(body.result);
	  		body.result.forEach((pod)=>{
	  			console.log(pod)

	  			request(sensiboAPI('/pods/' + pod.id + '/acStates'), { json: true }, (err, resPods, bodyPods) => {
		  			podsData = {_id: pod.id, acStates: bodyPods.result, name: ""}
		  			db.collection('sensibo').save(podsData, (err, result) => {
	    			if (err) return console.log(err)
				    console.log('saved to database')

				  	})	  				
	  			})
	  		})
	  		
	  	}
	  }
	  
	});

	app.get('/', (req, res) => {
	  res.send('Api for SmartHome APP')
	});


	app.get('/sensibo/:id',  (req, res) => {
		console.log(req.params.id)

	})

	app.post('/sensibo/:id/temp/:temp', (req, res) => {
		console.log("entro")
		request({uri: sensiboAPI('/pods/' + req.params.id + '/acStates'), method: "POST", json: true, body: {"acState": {"targetTemperature": 21}}}, (err, response, body) => { console.log(body) })
	})

	app.get('/sensibo', (req, res) => {

		request(sensiboAPI('/users/me/pods'), { json: true }, (err, response, body) => {
		  if (err) { return console.log(err); }
		  console.log(response.statusCode);
		  if (response.statusCode == 200){
		  	if (body.status == "success"){
		  		res.statusCode = response.statusCode
		  		res.send( body.result );
		  	}

		  }

		  
		});

	});

	let server = app.listen(3000, () => {
	  console.log('listening on 3000')
	});



});