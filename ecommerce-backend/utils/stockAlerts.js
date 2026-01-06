exports.checkLowStock = async () => {
    const Product = require('../models/Product');
    
    const lowStockProducts = await Product.find({
        stockStatus: 'low-stock'
    }).select('name stock lowStockThreshold');
    
    return lowStockProducts;
};