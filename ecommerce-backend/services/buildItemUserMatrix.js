const Order = require('../models/Order');

module.exports = async function buildItemUserMatrix() {
  const orders = await Order.find().lean();
  const matrix = {};

  orders.forEach(order => {
    const userId = order.user.toString();

    order.items.forEach(item => {
      const productId = item.product.toString();
      if (!matrix[productId]) matrix[productId] = {};
      matrix[productId][userId] =
        (matrix[productId][userId] || 0) + item.quantity;
    });
  });

  return matrix;
};