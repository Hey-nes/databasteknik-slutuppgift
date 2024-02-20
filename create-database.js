import mongoose, { Schema } from "mongoose";

// Creates supplier schema & model
export const supplierSchema = mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
});
export const Supplier = mongoose.model("Supplier", supplierSchema);

// Creates product schema & model
export const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  stock: { type: Number, required: true },
  supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
});
export const Product = mongoose.model("Product", productSchema);

// Creates categories schema & model
export const categorySchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});
export const Category = mongoose.model("Category", categorySchema);

// Creates offers schema & model
export const offerSchema = mongoose.Schema({
  products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  price: { type: Number, required: true },
  active: { type: Boolean, default: true },
});
export const Offer = mongoose.model("Offer", offerSchema);

// Creates sales order schema & model
export const salesOrderSchema = mongoose.Schema({
  offer: { type: Schema.Types.ObjectId, ref: "Offer" },
  quantity: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "shipped"],
    default: "pending",
  },
});
export const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema);

async function createDatabase() {
  try {
    mongoose.connect("mongodb://127.0.0.1:27017/databasteknik-slutuppgift");

    // Adds suppliers data, inserts data
    const suppliersData = [
      {
        name: "Electronics Supplier Inc.",
        contact: "John Doe (john@electronicsupplier.com)",
      },
      {
        name: "Fashion Supplier Co.",
        contact: "Jane Smith (jane@fashionsupplier.com)",
      },
    ];
    const createdSuppliers = await Supplier.insertMany(suppliersData);

    // Adds product data, inserts data
    const productsData = [
      {
        name: "Laptop",
        category: "Electronics",
        price: 1000,
        cost: 800,
        stock: 50,
        supplier: createdSuppliers[0]._id,
      },
      {
        name: "Smartphone",
        category: "Electronics",
        price: 800,
        cost: 600,
        stock: 40,
        supplier: createdSuppliers[0]._id,
      },
      {
        name: "T-shirt",
        category: "Clothing",
        price: 20,
        cost: 10,
        stock: 100,
        supplier: createdSuppliers[1]._id,
      },
      {
        name: "Refrigerator",
        category: "Home Appliances",
        price: 1200,
        cost: 1000,
        stock: 30,
        supplier: createdSuppliers[0]._id,
      },
      {
        name: "Shampoo",
        category: "Beauty & Personal Care",
        price: 10,
        cost: 5,
        stock: 80,
        supplier: createdSuppliers[1]._id,
      },
      {
        name: "Soccer Ball",
        category: "Sports & Outdoors",
        price: 30,
        cost: 20,
        stock: 60,
        supplier: createdSuppliers[1]._id,
      },
    ];
    const createdProducts = await Product.insertMany(productsData);

    // Adds categories data, inserts data
    const categoriesData = [
      {
        name: "Electronics",
        description: "Products related to electronics.",
      },
      {
        name: "Clothing",
        description: "Products related to clothing.",
      },
      {
        name: "Home Appliances",
        description: "Products related to home appliances.",
      },
      {
        name: "Beauty & Personal Care",
        description: "Products related to home beauty & personal care.",
      },
      {
        name: "Sports & Outdoors",
        description: "Products related to sports & outdoors.",
      },
    ];
    const createdCategories = await Category.insertMany(categoriesData);

    // Adds offers data, inserts data
    const offersData = [
      {
        products: [createdProducts[0]._id, createdProducts[1]._id],
        price: 1800,
        active: true,
      },
      {
        products: [createdProducts[2]._id, createdProducts[4]._id],
        price: 30,
        active: true,
      },
      {
        products: [
          createdProducts[3]._id,
          createdProducts[1]._id,
          createdProducts[5]._id,
        ],
        price: 1830,
        active: false,
      },
    ];
    const createdOffers = await Offer.insertMany(offersData);

    // Adds sales order data, inserts data
    const salesOrdersData = [
      {
        offer: createdOffers[0]._id,
        quantity: 2,
        status: "pending",
      },
      {
        offer: createdOffers[2]._id,
        quantity: 1,
        status: "pending",
      },
    ];
    const createdSalesOrders = await SalesOrder.insertMany(salesOrdersData);

    console.log("Database created successfully!");
  } catch (error) {
    console.error("Error creating database:", error);
  } finally {
    mongoose.connection.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createDatabase();
}
