require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const app = express()
const port = 5000

app.use(cors());
app.use(express.json());

// console.log(process.env);

const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection

        const db = client.db("walmartDB");
        const userCollection = db.collection('users');
        const productCollection = db.collection('products');


        app.post('/add-product', async (req, res) => {
            const product = req.body;

            // Remove or fix the incorrect check
            if (!product || !product.name || !product.price || !product.description || !product.category || !product.stock) {
                return res.status(400).json({ message: "All product fields are required" });
            }

            try {
                const result = await productCollection.insertOne(product);
                if (result.insertedId) {
                    return res.status(201).json({ message: "Product added successfully", result });
                } else {
                    return res.status(500).json({ message: "Failed to insert product" });
                }
            } catch (err) {
                console.error("Error inserting product:", err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });

        app.get('/products', async (req, res) => {
            const { limit } = req.query;
            console.log(limit);
            try {
                if (limit) {
                    const products = await productCollection.find()
                        .limit(parseInt(limit))
                        .toArray();
                    return res.status(200).json(products);
                }


                const allProducts = await productCollection.find().toArray();
                res.status(200).json(allProducts);

            }
            catch(err){
                console.error("Error fetching products:", err);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });


        app.get('/product/:id',async(req,res)=> {
            // console.log('clicked');
            const {id}=req.params;
            // console.log(id);
            if(!id){
                return res.status(400).json({ message: "Product ID is required" });
            }

            try{
                const product = await productCollection.findOne({_id: new ObjectId(id)});
                if(!product){
                    return res.status(404).json({ message: "Product not found" });
                }
                else{
                    res.status(200).json(product);
                }
            }
            catch(err){
                console.error("Error fetching product:", err);
                res.status(500).json({ message: "Internal Server Error" });
            }
        })




        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
