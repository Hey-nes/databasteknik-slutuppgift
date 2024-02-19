import mongoose, { connect } from "mongoose";
import readline from "readline";

// Schemas
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
});
const Category = mongoose.model('Category', CategorySchema);

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  stock: { type: Number, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
});
const Product = mongoose.model('Product', ProductSchema);

async function run() {
  await connect("mongodb://127.0.0.1:27017/databasteknik-slutuppgift");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });


  // Functions go here
   async function addCategory(rl) {
    rl.question('Enter category name: ', async (name) => {
      rl.question('Enter category description: ', async (description) => {
        const category = new Category({ name, description });
        await category.save();
        console.log('Category added successfully!');
        app();
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
          app();
          break;
        case 3:
          console.log("You chose option 3.");
          app();
          break;
        case 4:
          console.log("You chose option 4.");
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
