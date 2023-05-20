const express = require('express')
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors())
app.use(express.json())

app.get ('/', (req, res)=>{
    res.send('assignment-11 is running')
});

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tcuzcs8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)    
    client.connect((err)=>{
    if(err) {
      console.error(err);
      return;
    }
    })
    const toyCollection = client.db('transformer').collection('toyTransformer')  

    const indexKeys = {name:1}
    const indexOptions = {name: "toyName"}
    const result = await toyCollection.createIndex(indexKeys, indexOptions)
    console.log(result);

    app.get ("/searchToy/:text", async (req, res)=>{
    const text = req.params.text;
    const result = await toyCollection.find({
      $or: [
        {name: {$regex: text, $options:"i"}}
      ]
    }).toArray()
    res.send (result)
    })


    app.post ('/uploadToy', async (req, res)=>{
        const data = req.body;
        console.log(data);
        const result = await toyCollection.insertOne(data)
        res.send(result)
    })

    app.get ('/allToys', async (req, res)=>{
      const limit = parseInt(req.query.limit);
        const toys = toyCollection.find().limit(limit)
        const result = await toys.toArray()
        res.send(result)
    })


    app.get('/toy/:id', async (req, res)=>{        
        const id = req.params.id;      
        const filter = {_id: new ObjectId(id)}      
        const result = await toyCollection.findOne(filter)
        res.send (result)
    })


    app.patch('/toy/:id', async (req, res)=>{        
        const id = req.params.id;
        const updatedToyData = req.body        
        const filter = {_id: new ObjectId(id)}
        const updatedDoc = {
            $set:{
                ...updatedToyData
            }
        }
        const result = await toyCollection.updateOne(filter, updatedDoc)
        res.send (result)
    })


    app.delete('/toy/:id', async (req, res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const result = await toyCollection.deleteOne(filter)
        res.send(result)
    
    })

    app.get ('/myToys/:email', async (req, res)=>{
      console.log(req.params.email);
      const result = await toyCollection.find({sellerEmail: req.params.email}).toArray();
      res.send(result)
    })


    app.get ('/category', async (req, res)=>{
      console.log(req.query.subCategory);
      let query = {};
      if (req.query.subCategory){
        query= {subCategory: req.query.subCategory}
      }
        const result = await toyCollection.find(query).toArray()
        res.send(result)
    })


        // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, ()=>{
    console.log(`Transformer server is running on port ${port}`)
})
