const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./db");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ===== User Schema =====
const userSchema = new mongoose.Schema({
  email:    String,
  username: { type: String, unique: true },
  password: String,
  upiId:    String  // auto set as username@upi
});
const User = mongoose.model("User", userSchema);

// ===== Cart Schema =====
const cartSchema = new mongoose.Schema({
  username:   { type: String, unique: true },
  items:      Array,
  grandTotal: { type: Number, default: 0 }
});
const Cart = mongoose.model("Cart", cartSchema);

// ===== Order Schema =====
const orderSchema = new mongoose.Schema({
  orderId:    String,
  username:   String,
  items:      Array,
  grandTotal: Number,
  status:     { type: String, default: "Paid" },
  date:       { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", orderSchema);

// ===== Product Schema =====
const productSchema = new mongoose.Schema({
  name:       String,
  price:      Number,
  image:      String,
  page:       String,
  material:   String,
  options:    Array,
  optionType: String,
});
const Product = mongoose.model("Product", productSchema);

// Seed products on startup
mongoose.connection.once("open", async () => {
  try {
    await Product.collection.dropIndex("productId_1").catch(() => {});
  } catch(e) {}

  const products = [
    {
      name: "Stylish Crochet Shrug",
      price: 999, image: "https://preview.redd.it/crochet-circle-vests-v0-upa2kjszpjjc1.jpeg?auto=webp&s=c2ff6bd241a7b0ccf40da2f0fb03fe88583bf8b7",
      page: "product1.html", material: "Cotton", optionType: "size",
      options: [
        { label: "S", price: 999,  stock: 5 },
        { label: "M", price: 1019, stock: 3 },
        { label: "L", price: 1029, stock: 2 }
      ]
    },
    {
      name: "Stylish Crochet Tote Bag",
      price: 499, image: "https://lucylocketland.co.uk/cdn/shop/files/IMG_2012.jpg?v=1738825894&width=1920",
      page: "product2.html", material: "Cotton Yarn", optionType: "size",
      options: [
        { label: "Small", price: 499, stock: 8 },
        { label: "Large", price: 749, stock: 6 }
      ]
    },
    {
      name: "Warm Crochet Beanie Hats",
      price: 299, image: "https://cdn.shopify.com/s/files/1/0680/7785/files/01_35c861cc-3614-40d6-85bb-6d2b5b9af9b3.jpg?v=1742810221",
      page: "product3.html", material: "Wool Blend", optionType: "color",
      options: [
        { label: "Beige",  price: 299, stock: 12 },
        { label: "Brown",  price: 319, stock: 7  },
        { label: "Black",  price: 279, stock: 4  },
        { label: "Random", price: 249, stock: 20 }
      ]
    },
    {
      name: "Cute Crochet Keychains",
      price: 499, image: "https://i.etsystatic.com/24271851/r/il/32825a/7098949374/il_570xN.7098949374_sawn.jpg",
      page: "product4.html", material: "Cotton", optionType: "set",
      options: [
        { label: "Set of 3 — Random", price: 499,  stock: 6 },
        { label: "Set of 5 — Random", price: 799,  stock: 4 },
        { label: "Full Set of 7",     price: 1499, stock: 2 }
      ]
    },
    {
      name: "Elegant Crochet Summer Dress",
      price: 1499, image: "https://preview.redd.it/easy-summer-clothing-patterns-v0-vs3ghrnwnx7d1.jpg?width=588&format=pjpg&auto=webp&s=6069ee43969b589616dba980c20a7f5c7bcf1ef8",
      page: "product5.html", material: "Cotton", optionType: "size",
      options: [
        { label: "S", price: 1499, stock: 6 },
        { label: "M", price: 1549, stock: 4 },
        { label: "L", price: 1599, stock: 2 }
      ]
    },
    {
      name: "Kindness Heart - Hand Crochet Brooch",
      price: 250, image: "https://www.theforestchild.in/cdn/shop/files/E79DCB08-D855-4050-BF08-3F52871ADBBD.jpg?v=1702347926",
      page: "product6.html", material: "Cotton Yarn, Polyester Fibre Filling", optionType: "color",
      options: [
        { label: "Assorted", price: 349, stock: 8 },
        { label: "Red",      price: 260, stock: 5 },
        { label: "Pink",     price: 255, stock: 7 },
        { label: "Yellow",   price: 240, stock: 4 },
        { label: "Blue",     price: 250, stock: 6 },
        { label: "Green",    price: 245, stock: 3 },
        { label: "Purple",   price: 265, stock: 5 }
      ]
    },
    {
      name: "Crochet Flowers Bouquet",
      price: 599, image: "https://m.media-amazon.com/images/I/61n8NutspsL.jpg",
      page: "product7.html", material: "Cotton Yarn", optionType: "color",
      options: [
        { label: "Crimson Red",     price: 589, stock: 6 },
        { label: "Burnt Orange",    price: 609, stock: 4 },
        { label: "Cornflower Blue", price: 649, stock: 3 },
        { label: "Bubblegum Pink",  price: 579, stock: 7 },
        { label: "Soft Lavender",   price: 639, stock: 5 }
      ]
    }
  ];

  for (const p of products) {
    const exists = await Product.findOne({ name: p.name });
    if (!exists) await Product.create(p);
  }
  console.log("Products seeded ✅");
});

// ===== ROOT =====
app.get("/", (req, res) => res.send("Backend running with MongoDB!"));

// ===== LOGIN =====
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({
    $or: [{ username }, { email: username }],
    password
  });
  if (!user) return res.json({ success: false, message: "Invalid username or password" });
  res.json({ success: true, message: "Login successful", username: user.username });
});

// ===== REGISTER =====
app.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const user = new User({
      email,
      username,
      password,
      upiId: `${username}@upi`  // auto set
    });
    await user.save();
    res.json({ success: true, message: "User registered!" });
  } catch (e) {
    res.json({ success: false, message: "Username already exists" });
  }
});

// ===== CART GET =====
app.get("/cart/:username", async (req, res) => {
  const cart = await Cart.findOne({ username: req.params.username });
  res.json(cart || { items: [], grandTotal: 0 });
});

// ===== CART POST =====
app.post("/cart/:username", async (req, res) => {
  const { cart, grandTotal } = req.body;
  await Cart.findOneAndUpdate(
    { username: req.params.username },
    { items: cart, grandTotal },
    { upsert: true, new: true }
  );
  res.json({ success: true, message: "Cart updated" });
});

// ===== VERIFY UPI + PAYMENT =====
app.post("/pay", async (req, res) => {
  const { username, upiId, pin } = req.body;

  // Find user
  const user = await User.findOne({ username });
  if (!user) return res.json({ success: false, message: "User not found" });

  // Get cart
  const cartData = await Cart.findOne({ username });
  if (!cartData || cartData.items.length === 0) {
    return res.json({ success: false, message: "Cart is empty" });
  }

  // Check if user has no UPI registered
  if (!user.upiId) {
    const orderId = "ORD" + Date.now();
    const order = new Order({
      orderId, username,
      items:      cartData.items,
      grandTotal: cartData.grandTotal,
      status:     "Not Paid"
    });
    await order.save();
    return res.json({ success: false, message: "No UPI ID registered. Payment failed. Order saved as Not Paid." });
  }

  // Check UPI ID
  if (user.upiId !== upiId) {
    const orderId = "ORD" + Date.now();
    const order = new Order({
      orderId, username,
      items:      cartData.items,
      grandTotal: cartData.grandTotal,
      status:     "Not Paid"
    });
    await order.save();
    return res.json({ success: false, message: "Invalid UPI ID. Payment failed." });
  }

  // Check PIN
  if (user.password !== pin) {
    return res.json({ success: false, message: "Wrong PIN. Transaction declined." });
  }

  // Save order as Paid
  const orderId = "ORD" + Date.now();
  const order = new Order({
    orderId, username,
    items:      cartData.items,
    grandTotal: cartData.grandTotal,
    status:     "Paid"
  });
  await order.save();

  // Clear cart
  await Cart.findOneAndUpdate(
    { username },
    { items: [], grandTotal: 0 }
  );

  res.json({ success: true, orderId, message: "Payment successful!" });
});

// ===== GET ORDERS =====
app.get("/orders/:username", async (req, res) => {
  const orders = await Order.find({ username: req.params.username }).sort({ date: -1 });
  res.json(orders);
});

// ===== Stock Schema =====
const stockSchema = new mongoose.Schema({
  productId: String,
  size:      String,
  stock:     { type: Number, default: 0 }
});
stockSchema.index({ productId: 1, size: 1 }, { unique: true });
const Stock = mongoose.model("Stock", stockSchema);

// Drop bad indexes on startup
mongoose.connection.once("open", async () => {
  try {
    await Stock.collection.dropIndex("productKey_1").catch(() => {});
    await Stock.collection.dropIndex("productId_1").catch(() => {});
    await Stock.deleteMany({ productId: { $exists: false } });
    await Stock.deleteMany({ productId: null });
  } catch(e) {}

  // Auto-seed all product variants if not already in DB
  const allStock = [
    { productId: "shrug",    size: "S",               stock: 5 },
    { productId: "shrug",    size: "M",               stock: 3 },
    { productId: "shrug",    size: "L",               stock: 2 },
    { productId: "totebag",  size: "Small",           stock: 8 },
    { productId: "totebag",  size: "Large",           stock: 6 },
    { productId: "beanie",   size: "Beige",           stock: 12 },
    { productId: "beanie",   size: "Brown",           stock: 7 },
    { productId: "beanie",   size: "Black",           stock: 4 },
    { productId: "beanie",   size: "Random",          stock: 20 },
    { productId: "keychain", size: "set3",            stock: 6 },
    { productId: "keychain", size: "set5",            stock: 4 },
    { productId: "keychain", size: "full",            stock: 2 },
    { productId: "dress",    size: "S",               stock: 6 },
    { productId: "dress",    size: "M",               stock: 4 },
    { productId: "dress",    size: "L",               stock: 2 },
    { productId: "brooch",   size: "Assorted",        stock: 8 },
    { productId: "brooch",   size: "Red",             stock: 5 },
    { productId: "brooch",   size: "Pink",            stock: 7 },
    { productId: "brooch",   size: "Yellow",          stock: 4 },
    { productId: "brooch",   size: "Blue",            stock: 6 },
    { productId: "brooch",   size: "Green",           stock: 3 },
    { productId: "brooch",   size: "Purple",          stock: 5 },
    { productId: "bouquet",  size: "Crimson Red",     stock: 6 },
    { productId: "bouquet",  size: "Burnt Orange",    stock: 4 },
    { productId: "bouquet",  size: "Cornflower Blue", stock: 3 },
    { productId: "bouquet",  size: "Bubblegum Pink",  stock: 7 },
    { productId: "bouquet",  size: "Soft Lavender",   stock: 5 },
  ];

  for (const item of allStock) {
    await Stock.findOneAndUpdate(
      { productId: item.productId, size: item.size },
      { $setOnInsert: { stock: item.stock } },
      { upsert: true, new: true }
    );
  }
  console.log("Stock seeded ✅");
});

// ===== MANUAL SEED ROUTE =====
app.get("/seed-stock", async (req, res) => {
  const allStock = [
    { productId: "shrug",    size: "S",               stock: 5 },
    { productId: "shrug",    size: "M",               stock: 3 },
    { productId: "shrug",    size: "L",               stock: 2 },
    { productId: "totebag",  size: "Small",           stock: 8 },
    { productId: "totebag",  size: "Large",           stock: 6 },
    { productId: "beanie",   size: "Beige",           stock: 12 },
    { productId: "beanie",   size: "Brown",           stock: 7 },
    { productId: "beanie",   size: "Black",           stock: 4 },
    { productId: "beanie",   size: "Random",          stock: 20 },
    { productId: "keychain", size: "set3",            stock: 6 },
    { productId: "keychain", size: "set5",            stock: 4 },
    { productId: "keychain", size: "full",            stock: 2 },
    { productId: "dress",    size: "S",               stock: 6 },
    { productId: "dress",    size: "M",               stock: 4 },
    { productId: "dress",    size: "L",               stock: 2 },
    { productId: "brooch",   size: "Assorted",        stock: 8 },
    { productId: "brooch",   size: "Red",             stock: 5 },
    { productId: "brooch",   size: "Pink",            stock: 7 },
    { productId: "brooch",   size: "Yellow",          stock: 4 },
    { productId: "brooch",   size: "Blue",            stock: 6 },
    { productId: "brooch",   size: "Green",           stock: 3 },
    { productId: "brooch",   size: "Purple",          stock: 5 },
    { productId: "bouquet",  size: "Crimson Red",     stock: 6 },
    { productId: "bouquet",  size: "Burnt Orange",    stock: 4 },
    { productId: "bouquet",  size: "Cornflower Blue", stock: 3 },
    { productId: "bouquet",  size: "Bubblegum Pink",  stock: 7 },
    { productId: "bouquet",  size: "Soft Lavender",   stock: 5 },
  ];
  let added = 0;
  for (const item of allStock) {
    const exists = await Stock.findOne({ productId: item.productId, size: item.size });
    if (!exists) {
      await Stock.create(item);
      added++;
    }
  }
  res.json({ success: true, message: `${added} stock documents added` });
});

// ===== STOCK GET =====
app.get("/stock/:productId/:size", async (req, res) => {
  const { productId, size } = req.params;
  const record = await Stock.findOne({ productId, size });
  res.json(record || { productId, size, stock: null });
});

// ===== STOCK INIT (set default if not exists) =====
app.post("/stock/init", async (req, res) => {
  const { productId, size, stock } = req.body;
  const existing = await Stock.findOne({ productId, size });
  if (!existing) {
    await Stock.create({ productId, size, stock });
  }
  const record = await Stock.findOne({ productId, size });
  res.json({ stock: record.stock });
});

// ===== STOCK UPDATE =====
app.post("/stock/update", async (req, res) => {
  const { productId, size, delta } = req.body; // delta: -1 reduce, +1 restore
  const record = await Stock.findOne({ productId, size });
  if (!record) return res.json({ success: false, message: "Stock not found" });
  const newStock = Math.max(0, record.stock + delta);
  record.stock = newStock;
  await record.save();
  res.json({ success: true, stock: newStock });
});

// ===== Wishlist Schema =====
const wishlistSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  items:    Array
});
const Wishlist = mongoose.model("Wishlist", wishlistSchema);

// ===== WISHLIST GET =====
app.get("/wishlist/:username", async (req, res) => {
  const wishlist = await Wishlist.findOne({ username: req.params.username });
  res.json(wishlist || { items: [] });
});

// ===== WISHLIST POST =====
app.post("/wishlist/:username", async (req, res) => {
  const { items } = req.body;
  await Wishlist.findOneAndUpdate(
    { username: req.params.username },
    { items },
    { upsert: true, new: true }
  );
  res.json({ success: true, message: "Wishlist updated" });
});

app.listen(4000, () => console.log("Server running on port 4000"));