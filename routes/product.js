const Product = require('../models/Product');
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('./verifyToken');

const router = require('express').Router();


//CREATE PRODUCT
router.post('/', verifyTokenAndAdmin, async (req, res) => {
    const newProduct = new Product(req.body);

    try {
        const savedProduct = await newProduct.save()
        res.status(200).json(savedProduct)
    } catch(err) {
        res.status(500).json(err)
    }
})


//UPDATE PRODUCT
router.put('/:id', verifyTokenAndAuthorization, async (req, res) => {

    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new: true}
        )
        res.status(200).json(updatedProduct)
    } catch(err) {
        res.status(500).json(err);
    }
})

//DELETE PRODUCT
router.delete('/:id', verifyTokenAndAuthorization, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id)

        res.status(200).json("Product has been deleted")
        
    } catch(err) {
        res.status(500).json(err)
    }
})


//GET PRODUCT

router.get('/find/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        res.status(200).json(product)
    } catch(err) {
        res.status(500).json(err)
    }
})


//GET ALL PRODUCTS
router.get('/', verifyTokenAndAdmin, async (req, res) => {
    const qNew = req.query.new; //checking if there is a query new=true
    const qCategory = req.query.category; //checking if there is a query with category

    try {
        let products;

        if(qNew) {
            products = await Product.find().sort({ createdAt: -1 }).limit(5);
        } else if(qCategory) {
            products = await Product.find({
                categories: {
                    $in: [qCategory]
                }
            })
        } else {
            products = await Product.find();
        } 
        res.status(200).json(products)
    } catch(err) {
        res.status(500).json(err)
    }
})


//GET USER STATS
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.getFullYear(date.getFullYear() - 1))

    try {

        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear}} },
            {
                $project: {
                    month: { $month: "$createdAt" },
                }
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1 }
                }
            }
        ])
        res.status(200).json(data)
    } catch(err) {
        res.status(500).json(err)
    }
})

module.exports = router;