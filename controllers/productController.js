const slugify = require("slugify");
const ProductModel = require("../models/ProductModel");
const fs = require("fs");
const createProductController = async (req, res) => {
    try {
        const { name, slug, description, price, category, quantity, shipping } =
            req.fields;
        const { photo } = req.files;
        //Validation
        switch (true) {
            case !name:
                return res.status(500).send({ message: "Name is Required" });
            case !description:
                return res.status(500).send({ message: "Description is Required" });
            case !price:
                return res.status(500).send({ message: "Price is Required" });
            case !category:
                return res.status(500).send({ message: "Category is Required" });
            case !quantity:
                return res.status(500).send({ message: "Quantity is Required" });
            case photo && photo.size > 1000000:
                return res.status(500).send({ message: "Photo is Required and should be less than 1mb" });
        }
        const products = new ProductModel({ ...req.fields, slug: slugify(name) });
        if (photo) {
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({
            success: true,
            message: "Product Created SuccessFully !!",
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in creating Product Api",
            error,
        });
    }
};
//get all products
const getProductController = async (req, res) => {
    try {
        const products = await ProductModel.find({}).populate("category").select("-photo").limit(12).sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            TotalProducts: products.length,
            message: "All  Products listed SuccessFully !!",
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in getting All Products Api",
            error
        });
    }
};
//get single product 
const getSingleProductController = async (req, res) => {
    try {
        const product = await ProductModel.findOne({ slug: req.params.slug }).select("-photo").populate("category");
        if (!product) {
            return res.status(404).send({
                success: false,
                message: "No Product found with this Name",
            });
        }
        return res.status(200).send({
            success: true,
            message: "Product found successfully",
            product
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in getting Single Product Api",
            error
        });
    }
};
//get product photo controller 
const productPhotoController = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.pid);
        // Check if the product has a photo
        if (product.photo && product.photo.data) {
            res.set('Content-Type', product.photo.contentType);
            return res.send(product.photo.data);
        } else {
            return res.status(404).json({
                success: false,
                message: "Product photo not found",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in getting Product Photo Api",
            error
        });
    }
};
//delete product controller 
const deleteProductController = async (req, res) => {
    try {
        await ProductModel.findByIdAndDelete(req.params.pid).select("-photo");
        res.status(200).send({
            success: true,
            message: "Product Deleted SuccessFully!!!",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Deleting Product Api",
            error
        });
    }
};

//update product controller 
const updateProductController = async (req, res) => {
    try {
        const { name, slug, description, price, category, quantity, shipping } =
            req.fields;
        const { photo } = req.files;
        //Validation
        switch (true) {
            case !name:
                return res.status(500).send({ error: "Name is Required" });
            case !description:
                return res.status(500).send({ error: "Description is Required" });
            case !price:
                return res.status(500).send({ error: "Price is Required" });
            case !category:
                return res.status(500).send({ error: "Category is Required" });
            case !quantity:
                return res.status(500).send({ error: "Quantity is Required" });
            case photo && photo.size > 10000000:
                return res.status(500).send({ error: "Photo is Required and should be less than 1mb" });
        }
        const products = await ProductModel.findByIdAndUpdate(req.params.pid, {
            ...req.fields, slug: slugify(name)
        }, { new: true });
        if (photo) {
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({
            success: true,
            message: "Product Updated SuccessFully !!",
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in updating Product Api",
            error
        });
    }
};

//filters
const productFilterController = async (req, res) => {
    try {
        const { checked, radio } = req.body;


        let args = {};
        if (checked.length > 0) {
            args.category = checked;
        }

        if (radio.length === 2) {
            args.price = { $gte: radio[0], $lte: radio[1] };
        }



        // Assuming you have a properly defined ProductModel for database access
        const products = await ProductModel.find(args);


        res.status(200).send({
            success: true,
            products
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(400).send({
            success: false,
            message: "Error While Filtering Products",
            error: error.message // Sending only the error message to the client for security reasons
        });
    }
};
//product count controller 

const productCountController = async (req, res) => {
    try {
        const total = await ProductModel.find({}).estimatedDocumentCount();
        res.status(200).send({
            success: true,
            total,
        });
    } catch (error) {

        res.status(400).send({
            success: false,
            message: "Error in Product Count",
            error: error, // Sending only the error message to the client for security reasons
        });
    }
};
//product list base on page 
const productListController = async (req, res) => {
    try {
        const perpage = 6;
        const page = req.params.page ? req.params.page : 1;
        const products = await ProductModel.find({}).select("-select").skip((page - 1) * perpage).limit(perpage).sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            products
        });
    } catch (error) {
        res.status(400).send({
            success: false,
            message: "Error in Product Pagination",
            error, // Sending only the error message to the client for security reasons
        });
    }
};

//search product 
const searchcontroller = async (req, res) => {
    try {
        const { keyword } = req.params;
        const results = await ProductModel.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ]
        }).select("-photo");
        res.json(results);
    } catch (error) {
        res.status(400).send({
            success: false,
            message: "Error in Search Product Api",
            error, // Sending only the error message to the client for security reasons
        });
    }
};

module.exports = { createProductController, getProductController, getSingleProductController, productPhotoController, deleteProductController, updateProductController, productFilterController, productCountController, productListController, searchcontroller };
