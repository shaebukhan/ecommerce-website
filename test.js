const productPhotoController = async (req, res) => {
    try {
        const productId = req.params.pid;

        // Find the product by its ID
        const product = await ProductModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

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