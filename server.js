// @ts-check

const fs = require('fs');
const express = require('express');
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const { MongoMemoryServer } =  require('mongodb-memory-server')

const mongoServer = new MongoMemoryServer({
  instance: {
    dbName: "ourdb"
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
  const connection = await mongodb.connect(uri);

  const carsCollection = connection.db("ourdb").collection('cars');

  const expressApp = express();
  expressApp.use(bodyParser.json());

  await new Promise((resolve, reject) => {
    expressApp.listen(8080, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve();
      }
    });
  });

  expressApp.get('/cars', wrapExpressHandler(async (request) => {
    const cursor = carsCollection.find();
    const carsArray = await cursor.toArray();
    await cursor.close();
    return carsArray;
  }));

  expressApp.post('/cars',wrapExpressHandler(async (request) => {
    const r = await carsCollection.insertOne(request.body);
    return r.insertedId
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
