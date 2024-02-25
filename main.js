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

  // Add category
  async function addCategory(rl) {
    rl.question("Enter category name: ", async (name) => {
      rl.question("Enter category description: ", async (description) => {
        const category = new Category({ name, description });
        await category.save();
        console.log("Category added successfully!");
        app(rl);
      });
    });
  }

  // Add product with supplier check
  async function addProduct(rl) {
    rl.question("Enter product name: ", (name) => {
      rl.question("Enter product category: ", (category) => {
        rl.question("Enter product price: ", (price) => {
          rl.question("Enter product cost: ", (cost) => {
            rl.question("Enter product stock: ", (stock) => {
              rl.question("Enter supplier name: ", async (supplierName) => {
                let supplier = await Supplier.findOne({ name: supplierName });
                if (!supplier) {
                  console.log("Supplier not found! Adding new supplier...");
                  await addSupplier(supplierName, rl, async (newSupplier) => {
                    const product = new Product({
                      name,
                      category,
                      price: parseFloat(price),
                      cost: parseFloat(cost),
                      stock: parseInt(stock, 10),
                      supplier: newSupplier._id,
                    });
                    await product.save();
                    console.log(
                      "Product added successfully with new supplier!"
                    );
                    app(rl);
                  });
                } else {
                  const product = new Product({
                    name,
                    category,
                    price: parseFloat(price),
                    cost: parseFloat(cost),
                    stock: parseInt(stock, 10),
                    supplier: supplier._id,
                  });
                  await product.save();
                  console.log("Product added successfully!");
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

    rl.question(
      "Please select a supplier (case sensitive): ",
      async (selectedSupplierName) => {
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

          const products = await Product.find({
            supplier: selectedSupplier._id,
          });
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
      }
    );
  };

  // View all offers within a price range
  async function viewOffersWithinPriceRange(rl) {
    rl.question("Enter minimum price: ", (minPrice) => {
      rl.question("Enter maximum price: ", async (maxPrice) => {
        try {
          const offers = await Offer.find({
            price: { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) },
          }).populate("products");

          if (offers.length === 0) {
            console.log(
              `No offers found within the price range of ${minPrice} to ${maxPrice}.`
            );
          } else {
            console.log(
              `Offers found within the price range of ${minPrice} to ${maxPrice}:`
            );
            offers.forEach((offer, index) => {
              console.log(`Offer ${index + 1}: Price - ${offer.price}`);
              console.log("Included products:");
              offer.products.forEach((product, productIndex) => {
                console.log(
                  `\tProduct ${productIndex + 1}: Name - ${product.name
                  }, Category - ${product.category}, Price - ${product.price}`
                );
              });
            });
          }
        } catch (error) {
          console.error("Error fetching offers within price range:", error);
        } finally {
          app(rl);
        }
      });
    });
  }

  // View all offers that contain a product from a specific category
  async function viewOffersByCategory(rl) {
    rl.question("Enter the category name: ", async (categoryName) => {
      try {
        // Find products by category
        const products = await Product.find({ category: categoryName }).exec();
        if (products.length === 0) {
          console.log(`No products found in the category: ${categoryName}`);
          app(rl);
          return;
        }
        // Extract product IDs
        const productIds = products.map((product) => product._id);
        // Find offers that include any of the products
        const offers = await Offer.find({ products: { $in: productIds } })
          .populate("products")
          .exec();
        if (offers.length === 0) {
          console.log(
            `No offers found containing products from the category: ${categoryName}`
          );
        } else {
          console.log(
            `Offers containing products from the category: ${categoryName}`
          );
          offers.forEach((offer, index) => {
            console.log(
              `Offer ${index + 1}: Price - ${offer.price}, Active - ${offer.active ? "Yes" : "No"
              }`
            );
            offer.products.forEach((product, productIndex) => {
              console.log(
                `\tProduct ${productIndex + 1}: Name - ${product.name
                }, Category - ${product.category}, Price - ${product.price}`
              );
            });
          });
        }
      } catch (error) {
        console.error("Error fetching offers by category:", error);
      } finally {
        app(rl);
      }
    });
  }

  // View offers based on stock
  const viewOffersBasedOnStock = async () => {
    const offers = await Offer.find().populate("products");

    let allInStockOffers = [],
      someInStockOffers = [],
      noneInStockOffers = [];

    offers.forEach((offer) => {
      const productStocks = offer.products.map((product) => product.stock);
      const fullyStocked = productStocks.every((stock) => stock > 0);
      const outOfStock = productStocks.every((stock) => stock === 0);
      const someStock = productStocks.some((stock) => stock > 0) && productStocks.some((stock) => stock === 0);

      if (fullyStocked) {
        allInStockOffers.push(offer);
      } else if (outOfStock) {
        noneInStockOffers.push(offer);
      } else if (someStock) {
        someInStockOffers.push(offer);
      }
    });

    console.log(`Offers with all products in stock: ${allInStockOffers.length}`);
    allInStockOffers.forEach((offer, index) => {
      console.log(`Offer ${index + 1} with all products in stock:`, offer);
    });

    console.log(`Offers with some products in stock: ${someInStockOffers.length}`);
    someInStockOffers.forEach((offer, index) => {
      console.log(`Offer ${index + 1} with some products in stock:`, offer);
    });

    console.log(`Offers with no products in stock: ${noneInStockOffers.length}`);
    noneInStockOffers.forEach((offer, index) => {
      console.log(`Offer ${index + 1} with no products in stock:`, offer);
    });


    app();
  };


  // Create order for products
  const createOrderForProducts = async (rl) => {
    console.log("Fetching products...");
    const products = await Product.find({}).populate("supplier");

    products.forEach((product, index) => {
      console.log(
        `${index + 1}: ${product.name} - Price: ${product.price}, Stock: ${product.stock
        }`
      );
    });

    rl.question(
      "Choose a product by entering the number: ",
      async (productNumber) => {
        const productIndex = parseInt(productNumber, 10) - 1;

        if (productIndex >= 0 && productIndex < products.length) {
          const selectedProduct = products[productIndex];

          rl.question("Enter quantity: ", async (quantity) => {
            const orderQuantity = parseInt(quantity, 10);
            // Check for discount eligibility
            const priceAdjustmentFactor = orderQuantity > 10 ? 0.9 : 1; // 10% discount if more than 10
            const totalPrice =
              selectedProduct.price * orderQuantity * priceAdjustmentFactor;

            if (orderQuantity > 0 && orderQuantity <= selectedProduct.stock) {
              const totalPrice = orderQuantity * selectedProduct.price;
              // Apply a discount if the order quantity is more than 10
              const finalPrice =
                orderQuantity > 10 ? totalPrice * 0.9 : totalPrice;

              const order = new SalesOrder({
                product: selectedProduct._id,
                quantity: orderQuantity,
                status: "pending", // Default status pending
                totalPrice: finalPrice,
              });

              await order.save();
              console.log(
                `Order for ${orderQuantity} x ${selectedProduct.name
                } at total price $${finalPrice.toFixed(
                  2
                )} created successfully.`
              );
            } else {
              console.log(
                "Invalid quantity. Ensure it does not exceed available stock."
              );
            }
            app();
          });
        } else {
          console.log("Invalid product selection.");
          app();
        }
      }
    );
  };

  // Create order for offers
  const createOfferOrder = async (rl) => {
    console.log("Fetching active offers...");
    const offers = await Offer.find({ active: true }).populate("products");

    offers.forEach((offer, index) => {
      console.log(
        `${index + 1}: Offer Price: ${offer.price
        } - Products in Offer: ${offer.products.map((p) => p.name).join(", ")}`
      );
    });

    rl.question(
      "Choose an offer by entering the number: ",
      async (offerNumber) => {
        const offerIndex = parseInt(offerNumber, 10) - 1;

        if (offerIndex >= 0 && offerIndex < offers.length) {
          const selectedOffer = offers[offerIndex];

          rl.question("Enter quantity: ", async (quantity) => {
            const orderQuantity = parseInt(quantity, 10);
            if (orderQuantity > 0) {
              const order = new SalesOrder({
                offer: selectedOffer._id,
                quantity: orderQuantity,
                status: "pending",
              });

              await order.save();
              console.log(
                `Order for ${orderQuantity} x [Offer Price: ${selectedOffer.price}] created successfully.`
              );
            } else {
              console.log("Invalid quantity.");
            }
            app();
          });
        } else {
          console.log("Invalid offer selection.");
          app();
        }
      }
    );
  };

  // Ship orders
  const shipOrders = async () => {
    try {
      const pendingOrders = await SalesOrder.find({
        status: "pending",
      }).populate({
        path: "offer",
        populate: {
          path: "products",
          model: "Product",
        },
      });

      if (pendingOrders.length === 0) {
        console.log("No pending orders to ship.");
        app();
        return;
      }

      for (const order of pendingOrders) {
        // Mark the order as shipped
        order.status = "shipped";
        await order.save();

        for (const product of order.offer.products) {
          product.stock -= order.quantity;
          await product.save();
        }

        for (const product of order.offer.products) {
          product.stock -= order.quantity;
          await product.save();
        }
      }

      console.log("All pending orders have been shipped successfully.");
    } catch (error) {
      console.error("Error shipping orders:", error);
    } finally {
      app();
    }
  };

  // Add a new supplier
  const addSupplier = async (supplierName, rl, callback) => {
    rl.question(
      `Enter the e-mail address for ${supplierName}: `,
      async (contact) => {
        const newSupplier = new Supplier({
          name: supplierName,
          contact,
        });

        try {
          const savedSupplier = await newSupplier.save();
          console.log("New supplier added successfully:", savedSupplier);
          callback(savedSupplier); // Proceed to callback with the new supplier
        } catch (error) {
          console.error("Error adding new supplier:", error);
          app(rl);
        }
      }
    );
  };

  // View suppliers
  const viewSuppliers = async () => {
    Supplier.find({})
      .then((suppliers) => {
        console.log("Suppliers:");
        suppliers.forEach((supplier) => {
          console.log(`Name: ${supplier.name}`);
          console.log(`Contact: ${supplier.contact}`);
        });
        app();
      })
      .catch((error) => {
        console.error("Error retreiving suppliers: ", error);
        app();
      });
  };

  // View sales orders
  const viewSalesOrders = async () => {
    try {
      const orders = await SalesOrder.find({}).populate({
        path: "offer",
        populate: {
          path: "products",
          model: "Product",
        },
      });

      if (orders.length === 0) {
        console.log("No orders found.");
        app();
        return;
      }

      console.log("Orders:");
      orders.forEach(async (order) => {
        let totalCost = 0;

        if (order.offer) {
          order.offer.products.forEach((product) => {
            totalCost += product.price;
          });
        } else {
          const products = await Product.find({ _id: { $in: order.products } });
          products.forEach((product) => {
            totalCost += product.price;
          });
        }

        console.log(`Order number: ${order._id}`);
        console.log(`Order status: ${order.status}`);
        console.log(`Total cost: ${totalCost}`);
      });

      app();
    } catch (error) {
      console.error("Error retrieving orders: ", error);
      app();
    }
  };

  // View sum of profits
  const viewSumOfProfits = async () => {
    try {
      let totalProfit = 0;

      const salesOrders = await SalesOrder.find({}).populate({
        path: "offer",
        populate: {
          path: "products",
          model: "Product",
        },
      });

      salesOrders.forEach((order) => {
        let totalRevenue = 0;
        let totalCOGS = 0;

        if (order.offer) {
          order.offer.products.forEach((product) => {
            totalRevenue += product.price;
            totalCOGS += product.cost;
          });
        }

        const profit = totalRevenue - totalCOGS;
        totalProfit += profit;
      });

      console.log(`Total profit from sales orders: ${totalProfit}$`);

      rl.question(
        "Enter the name of a product to view profits from offers containing it: ",
        async (productName) => {
          try {
            const product = await Product.findOne({ name: productName });

            if (!product) {
              console.log("Product not found.");
              app();
              return;
            }

            const offersContainingProduct = await Offer.find({
              products: product._id,
            }).populate("products");

            let productOffersProfit = 0;

            offersContainingProduct.forEach((offer) => {
              let offerRevenue = 0;
              let offerCOGS = 0;

              offer.products.forEach((offerProduct) => {
                offerRevenue += offer.price;
                offerCOGS += offerProduct.cost;
              });

              const offerProfit = offerRevenue - offerCOGS;
              productOffersProfit += offerProfit;
            });

            console.log(
              `Total profit from offers containing ${productName}: ${productOffersProfit}$`
            );
          } catch (error) {
            console.error("Error calculating profits:", error);
          } finally {
            app();
          }
        }
      );
    } catch (error) {
      console.error("Error retrieving sales orders:", error);
      app();
    }
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
          addCategory(rl);
          break;
        case 2:
          addProduct(rl);
          break;
        case 3:
          viewByCategory();
          break;
        case 4:
          viewBySupplier();
          break;
        case 5:
          viewOffersWithinPriceRange(rl);
          break;
        case 6:
          viewOffersByCategory(rl);
          break;
        case 7:
          viewOffersBasedOnStock();
          break;
        case 8:
          createOrderForProducts(rl);
          break;
        case 9:
          createOfferOrder(rl);
          break;
        case 10:
          shipOrders();
          break;
        case 11:
          rl.question(
            "Enter the name of the new supplier: ",
            (supplierName) => {
              addSupplier(supplierName, rl, () => {
                console.log("Supplier added to database");
                app(rl);
              });
            }
          );
          break;
        case 12:
          viewSuppliers();
          break;
        case 13:
          viewSalesOrders();
          break;
        case 14:
          viewSumOfProfits();
          break;
      }
    });
  };

  app();
}

run();
