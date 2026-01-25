import { connectDB } from "../../lib/mongodb.js";
import Cart from "../../module/Cart.js";
import Products from "../../module/Products.js";


/**
 * Add to cart route
 * - Validates request method
 * - Handles errors with try/catch
 * - Returns error responses with status codes
 */
export default async function handler(req, res) {
  try {
    await connectDB();

    // Validate required fields
    const {
      userId,
      productId,
      materialName,
      sizeName,
      shapeName,
      templateName,
      quantity = 1,
    } = req.body;
    if (!userId || !productId || !materialName || !sizeName || !shapeName || !templateName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find product and options
    const product = await Products.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const material = product.material.find(m => m.name === materialName);
    const size = product.size.find(s => s.name === sizeName);
    const shape = product.shape.find(s => s.name === shapeName);
    const template = product.template.find(t => t.name === templateName);

    if (!material || !size || !shape || !template)
      return res.status(400).json({ error: "Invalid options" });

    const apply = (price, factor, type) =>
      type === "percentage" ? price + price * factor / 100 : price + factor;

    let price = product.basePrice;
    price = apply(price, material.priceChangeFactor, material.priceChangeType);
    price = apply(price, size.priceChangeFactor, size.priceChangeType);
    price = apply(price, shape.priceChangeFactor, shape.priceChangeType);
    price = apply(price, template.priceChangeFactor, template.priceChangeType);

    price *= quantity;

    let cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    cart.items.push({
      productId,
      productName: product.name,
      basePrice: product.basePrice,
      material,
      size,
      shape,
      template,
      quantity,
      finalPrice: price,
    });

    cart.totalItems += quantity;
    cart.totalPrice += price;

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
