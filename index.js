const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

// MongoDB connection URI
const uri =
  "mongodb+srv://ahkj:Y9Qj01QHl753QEPk@miniproject.kktnwsl.mongodb.net/Flutter?retryWrites=true&w=majority&appName=MiniProject";

// Connect to MongoDB
mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Define schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const shoeSchema = new mongoose.Schema({
  shoeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const shoesSizesSchema = new mongoose.Schema({
  sizesId: { type: String, required: true, unique: true },
  shoeId: { type: String, required: true, ref: "Shoe" },
  size: { type: String, required: true },
});

const cartItemSchema = new mongoose.Schema({
  cartItemId: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true, ref: "User" },
  shoeId: { type: String, required: true, ref: "Shoe" },
  sizeId: { type: String, required: true, ref: "ShoesSize" },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true, ref: "User" },
  shoeId: { type: String, required: true, ref: "Shoe" },
  sizeId: { type: String, required: true, ref: "ShoesSize" },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

// Create models
const User = mongoose.model("User", userSchema);
const Shoe = mongoose.model("Shoe", shoeSchema);
const ShoesSize = mongoose.model("ShoesSize", shoesSizesSchema);
const CartItem = mongoose.model("CartItem", cartItemSchema);
const Order = mongoose.model("Order", orderSchema);

// User routes
app.post("/users/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = new User({ email, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error registering user" });
  }
});

app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      res.json({ message: "User authenticated successfully" });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error authenticating user" });
  }
});

// Shoe routes
app.post("/shoes", async (req, res) => {
  try {
    const { shoeId, name, price } = req.body;

    // Create a new shoe document
    const shoe = new Shoe({
      shoeId,
      name,
      price,
    });

    // Save the new shoe to the database
    await shoe.save();

    res.status(201).json({ message: "Shoe added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error adding shoe" });
  }
});

app.get("/shoes", async (req, res) => {
  try {
    const shoes = await Shoe.find();
    res.json(shoes);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving shoes" });
  }
});

app.get("/shoes/:shoeId", async (req, res) => {
  try {
    const { shoeId } = req.params;
    const shoe = await Shoe.findOne({ shoeId });
    if (shoe) {
      res.json(shoe);
    } else {
      res.status(404).json({ error: "Shoe not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error retrieving shoe details" });
  }
});

// Shoes Sizes routes
app.get("/shoes/:shoeId/sizes", async (req, res) => {
  try {
    const { shoeId } = req.params;
    const shoeSizes = await ShoesSize.find({ shoeId });
    res.json(shoeSizes);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving shoe sizes" });
  }
});

// Cart Item routes
app.get("/users/:userEmail/cart", async (req, res) => {
  try {
    const { userEmail } = req.params;
    const cartItems = await CartItem.find({ userEmail });
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving cart items" });
  }
});

app.post("/users/:userEmail/cart", async (req, res) => {
  try {
    const { userEmail } = req.params;
    const { shoeId, sizeId, quantity, totalPrice } = req.body;
    const cartItem = new CartItem({
      cartItemId: new mongoose.Types.ObjectId(),
      userEmail,
      shoeId,
      sizeId,
      quantity,
      totalPrice,
    });
    await cartItem.save();
    res.status(201).json({ message: "Cart item added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error adding cart item" });
  }
});

app.put("/users/:userEmail/cart/:cartItemId", async (req, res) => {
  try {
    const { userEmail, cartItemId } = req.params;
    const { quantity, totalPrice } = req.body;
    const cartItem = await CartItem.findOneAndUpdate(
      { userEmail, cartItemId },
      { quantity, totalPrice },
      { new: true }
    );
    if (cartItem) {
      res.json({ message: "Cart item updated successfully" });
    } else {
      res.status(404).json({ error: "Cart item not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error updating cart item" });
  }
});

app.delete("/users/:userEmail/cart/:cartItemId", async (req, res) => {
  try {
    const { userEmail, cartItemId } = req.params;
    const cartItem = await CartItem.findOneAndDelete({ userEmail, cartItemId });
    if (cartItem) {
      res.json({ message: "Cart item removed successfully" });
    } else {
      res.status(404).json({ error: "Cart item not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error removing cart item" });
  }
});

// Order routes
app.get("/orders/:orderId/items", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });
    if (order) {
      res.json([order]);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error retrieving order items" });
  }
});

app.get("/users/:userEmail/orders", async (req, res) => {
  try {
    const { userEmail } = req.params;
    const orders = await Order.find({ userEmail });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving orders" });
  }
});

app.post("/users/:userEmail/orders", async (req, res) => {
  try {
    const { userEmail } = req.params;
    const { shoeId, sizeId, quantity, price } = req.body;
    const order = new Order({
      orderId: new mongoose.Types.ObjectId(),
      userEmail,
      shoeId,
      sizeId,
      quantity,
      price,
    });
    await order.save();
    res.status(201).json({ message: "Order placed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error placing order" });
  }
});

app.get("/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error retrieving order details" });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
