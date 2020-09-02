// @ts-check

const fs = require('fs');
const express = require('express');
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Schema, Model } = require('mongoose');
const mongoose = require('mongoose');
const HTTP_PORT = process.env.HTTP_PORT || 8080;

const CarSchema = new Schema({
  year: {
    type: Number,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  manufacture: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const mongoServer = new MongoMemoryServer({
  instance: {
    dbName: "ourdb",
    port: 51220
  }
});

/**
 *
 * @param {(request: import('express').Request) => Promise<any>} handler
 */
function wrapExpressHandler(handler) {
  /**
   * @type {import('express').Handler}
   */
  const expressHandler = function expressHandler (req, res, next) {
    handler(req)
    .then((data) => {
      res.send(data);
    }, (error) => {
      res.status(502).send(error);
    });
  }

  return expressHandler;
}

async function main() {
  const uri = await mongoServer.getUri();

  const mongooseConnection = await mongoose.connect(uri, {
    dbName: "ourdb"
  });

  const CarModel = mongooseConnection.model("Car", CarSchema);

  console.log({ uri });
  // const connection = await mongodb.connect(uri);

  // const carsCollection = connection.db("ourdb").collection('cars');

  const expressApp = express();
  expressApp.use(bodyParser.json());

  await new Promise((resolve, reject) => {
    expressApp.listen(HTTP_PORT, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve();
      }
    });
  });

  expressApp.delete('/cars/:id', wrapExpressHandler(async (request) => {
    return await CarModel.findByIdAndDelete(request.params.id).exec();
  }));

  expressApp.put('/cars/:id', wrapExpressHandler(async (request) => {
    return await CarModel.findByIdAndUpdate(request.params.id, request.body).exec();
  }));

  expressApp.get('/cars', wrapExpressHandler(async (request) => {
    // const cursor = carsCollection.find();
    // const carsArray = await cursor.toArray();
    // await cursor.close();
    // return carsArray;
    return await CarModel.find().exec();
  }));

  // expressApp.post('/cars', wrapExpressHandler(async (request) => {
  //   const [inserted] = await CarModel.insertMany([request.body]);
  //   // const r = await carsCollection.insertOne(request.body);
  //   return inserted;
  // }));

  expressApp.post('/cars', wrapExpressHandler(async (request) => {
    const [inserted] = await CarModel.insertMany([request.body]);
    // const r = await carsCollection.insertOne(request.body);
    return inserted;
  }));

  // await carsCollection.insert({
  //   name: "Grand Vitara",
  //   model: 2005,
  // });

  // const cursor = carsCollection.find();

  // const carsArray = await cursor.toArray();

  // console.log({ carsArray });

  // await connection.close();
  // await mongoServer.stop();

  // return uri;
}

main()
.then((doneValue) => {
  console.info('done', doneValue);
  console.log(`http://localhost:${HTTP_PORT}`)
}, (error) => {
  console.error(error);
});

// const expressApp = express();

// const mongoServer = new MongoMemoryServer();


// mongoServer.getUri()
// .then((uri) => {
//   return mongodb.connect(uri);
// })
// .then((connection) => {
//   return 31231;
// });




// expressApp.get('/hello', (request, response, next) => {
//   response.send({
//     message: "ok"
//   })
// });

// expressApp.listen(8080, (error) => {
//   if (error) {
//     console.error(error);
//   } else {
//     console.log('server is running');
//   }
// });
