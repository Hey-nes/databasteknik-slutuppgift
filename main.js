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

  // View by category function
  const viewByCategory = async () => {
    try {
      const categories = await Product.distinct("category");
      console.log("List of categories: ");
      categories.forEach((category) => {
        console.log(category);
      });
    } catch {
      console.error("Error fetching categories: ", error);
    }
    rl.question("Please select a category: ", async (category) => {
      try {
        const selectedCategory = await Product.findOne({ category: category });
        if (!selectedCategory) {
          console.log("Category not found!");
          app();
          return;
        }
        console.log(`You selected: ${category}`);
      } catch {}
    });
  };

  // View by supplier function
  const viewBySupplier = async () => {
    console.log(supplierSchema);
  };

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
          app();
          break;
        case 2:
          console.log("You chose option 2.");
          app();
          break;
        case 3:
          viewByCategory();
          break;
        case 4:
          viewBySupplier();
          app();
          break;
        case 5:
          console.log("You chose option 5.");
          app();
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
