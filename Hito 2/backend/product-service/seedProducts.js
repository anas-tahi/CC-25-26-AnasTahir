require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB for seeding"))
  .catch(err => console.error(err));

const products = [
  { name: "Atún" },
  { name: "Leche" },
  { name: "Pan" },
  { name: "Huevos" },
  { name: "Arroz" },
  { name: "Azúcar" },
  { name: "Aceite" },
  { name: "Pollo" },
  { name: "Manzana" },
  { name: "Tomate" }
];

const supermarkets = ["Mercadona", "Carrefour", "Alcampo", "Lidl"];

// Helper to generate random price between 0.5€ and 5€
const randomPrice = () => parseFloat((Math.random() * (5 - 0.5) + 0.5).toFixed(2));

async function seed() {
  try {
    await Product.deleteMany({});
    console.log("Old products deleted.");

    for (let product of products) {
      for (let market of supermarkets) {
        await Product.create({
          name: product.name,
          supermarket: market,
          price: randomPrice()
        });
      }
    }

    console.log("✅ Products seeded successfully!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
