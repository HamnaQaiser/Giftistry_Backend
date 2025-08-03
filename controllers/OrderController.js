exports.createOrder = async (req, res) => {
  try {
    const { cartItems, total } = req.body;
    const userId = req.user.id;

    const orderItems = cartItems.map((item) => ({
      product: item.id,
      quantity: item.quantity,
      customMessage: item.message || "",
      customImageFileName: item.imageFileName || "",
    }));

    const newOrder = await Order.create({
      user: userId,
      products: orderItems,
      total,
    });

    res.status(201).json({ message: "Order placed", order: newOrder });
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
};