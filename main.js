import mongoose, { connect } from "mongoose";
import readline from "readline";
import {
  supplierSchema,
  Supplier,
  productSchema,
  Product,
  categorySchema,
  Category,
  offerSchema,
  Offer,
  salesOrderSchema,
  SalesOrder,
} from "./create-database.js";

async function run() {
  await connect("mongodb://127.0.0.1:27017/databasteknik-slutuppgift");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Functions go here


 // Add Category
  async function addCategory(rl) {
  rl.question('Enter category name: ', async (name) => {
    rl.question('Enter category description: ', async (description) => {
      const category = new Category({ name, description });
      await category.save();
      console.log('Category added successfully!');
      app(rl);
    });
  });
}

// Add product
async function addProduct(rl) {
  rl.question('Enter product name: ', (name) => {
    rl.question('Enter product category: ', (category) => {
      rl.question('Enter product price: ', (price) => {
        rl.question('Enter product cost: ', (cost) => {
          rl.question('Enter product stock: ', (stock) => {
            rl.question('Enter supplier name: ', async (supplierName) => {
              try {
                const supplier = await Supplier.findOne({ name: supplierName });
                if (!supplier) {
                  console.log('Supplier not found!');
                  app(rl);
                  return;
                }
                const product = new Product({
                  name,
                  category,
                  price: parseFloat(price),
                  cost: parseFloat(cost),
                  stock: parseInt(stock, 10),
                  supplier: supplier._id,
                });
                await product.save();
                console.log('Product added successfully!');
                app(rl);
              } catch (error) {
                console.error('Error adding product:', error);
                app(rl);
              }
            });
          });
        });
      });
    });
  });
}

  // View by category function
  const viewByCategory = async () => {
    try {
      const categories = await Product.distinct("category");
      console.log("List of categories: ");
      categories.forEach((category) => {
        console.log(category);
      });
    } catch (error) {
      console.error("Error fetching categories: ", error);
    }

    rl.question(
      "Please select a category (case sensitive): ",
      async (category) => {
        category = category.trim();
        try {
          const products = await Product.find({ category: category });
          if (products.length === 0) {
            console.log("No products found for the selected category.");
            viewByCategory();
            return;
          }
          console.log(`Products with category ${category}:`);
          products.forEach((product) => {
            console.log(product.name);
          });
          app();
          return;
        } catch (error) {
          console.error("Error fetching products: ", error);
        }
      }
    );
  };

  // View by supplier function
  const viewBySupplier = async () => {
    try {
      const suppliers = await Supplier.find({}, "name");
      console.log("List of suppliers: ");
      suppliers.forEach((supplier) => {
        console.log(supplier.name);
      });
    } catch (error) {
      console.error("Error fetching suppliers: ", error);
    }

    rl.question("Please select a supplier (case sensitive): ", async (selectedSupplierName) => {
      selectedSupplierName = selectedSupplierName.trim();
      try {
        const selectedSupplier = await Supplier.findOne({
          name: selectedSupplierName,
        });
        if (!selectedSupplier) {
          console.log("Selected supplier not found.");
          viewBySupplier();
          return;
        }

        const products = await Product.find({ supplier: selectedSupplier._id });
        if (products.length === 0) {
          console.log("No products found for the selected supplier.");
          viewBySupplier();
          return;
        }

        console.log(`Products with supplier: ${selectedSupplierName}`);
        products.forEach((product) => {
          console.log(product.name);
        });
        app();
        return;
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    });
  };

 // View all offers within a price range

 async function viewOffersWithinPriceRange(rl) {
  rl.question('Enter minimum price: ', (minPrice) => {
    rl.question('Enter maximum price: ', async (maxPrice) => {
      try {
        const offers = await Offer.find({
          price: { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) }
        }).populate('products');

        if (offers.length === 0) {
          console.log(`No offers found within the price range of ${minPrice} to ${maxPrice}.`);
        } else {
          console.log(`Offers found within the price range of ${minPrice} to ${maxPrice}:`);
          offers.forEach((offer, index) => {
            console.log(`Offer ${index + 1}: Price - ${offer.price}`);
            console.log('Included products:');
            offer.products.forEach((product, productIndex) => {
              console.log(`\tProduct ${productIndex + 1}: Name - ${product.name}, Category - ${product.category}, Price - ${product.price}`);
            });
          });
        }
      } catch (error) {
        console.error('Error fetching offers within price range:', error);
      } finally {
        app(rl); 
      }
    });
  });
}

  const app = () => {
    console.log("Menu:");
    console.log("1. Add new category");
    console.log("2. Add new product");
    console.log("3. View products by category");
    console.log("4. View products by supplier");
    console.log("5. View all offers within a price range");
    console.log(
      "6. View all offers that contain a product from a specific category"
    );
    console.log(
      "7. View the number of offers based on the number of its products in stock"
    );
    console.log("8. Create order for products");
    console.log("9. Create order for offers");
    console.log("10. Ship orders");
    console.log("11. Add a new supplier");
    console.log("12. View suppliers");
    console.log("13. View all sales");
    console.log("14. View sum of all profits");

    rl.question("Make a choice by entering a number: ", (input) => {
      switch (parseInt(input)) {
        case 1:
          console.log("You chose option 1.");
          addCategory(rl);
          break;
        case 2:
          console.log("You chose option 2.");
          addProduct(rl);
          break;
        case 3:
          viewByCategory();
          break;
        case 4:
          viewBySupplier();
          break;
        case 5:
          console.log("You chose option 5.");
          viewOffersWithinPriceRange(rl);
          break;
        case 6:
          console.log("You chose option 6.");
          app();
          break;
        case 7:
          console.log("You chose option 7.");
          app();
          break;
        case 8:
          console.log("You chose option 8.");
          app();
          break;
        case 9:
          console.log("You chose option 9.");
          app();
          break;
        case 10:
          console.log("You chose option 10.");
          app();
          break;
        case 11:
          console.log("You chose option 11.");
          app();
          break;
        case 12:
          console.log("You chose option 12.");
          app();
          break;
        case 13:
          console.log("You chose option 13.");
          app();
          break;
        case 14:
          console.log("You chose option 14.");
          app();
          break;
      }
    });
  };

  app();
}

run();
