require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

/* -------------------- MONGO CONNECTION -------------------- */

const mongoUri =
  process.env.MONGO_URI ||
  process.env.PRODUCT_MONGO_URI ||
  process.env.PRODUCTS_MONGO_URI;

if (!mongoUri) {
  console.error("❌ No MongoDB URI provided.");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ Connected to MongoDB for seeding"))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

/* -------------------- SPANISH PRODUCTS -------------------- */

const products = [
  { name: "Leche Entera 1L", basePrice: 1.05 },
  { name: "Leche Semidesnatada 1L", basePrice: 1.00 },
  { name: "Pan Blanco", basePrice: 0.95 },
  { name: "Pan Integral", basePrice: 1.15 },
  { name: "Huevos Camperos (12)", basePrice: 2.80 },
  { name: "Arroz Redondo 1kg", basePrice: 1.35 },
  { name: "Pasta Espagueti", basePrice: 1.10 },
  { name: "Macarrones", basePrice: 1.05 },
  { name: "Azúcar Blanco 1kg", basePrice: 1.25 },
  { name: "Aceite de Oliva Virgen Extra 1L", basePrice: 7.20 },
  { name: "Aceite de Girasol 1L", basePrice: 2.30 },
  { name: "Pollo Entero", basePrice: 4.90 },
  { name: "Pechuga de Pollo", basePrice: 6.40 },
  { name: "Carne Picada Mixta", basePrice: 5.70 },
  { name: "Filetes de Ternera", basePrice: 9.50 },
  { name: "Atún en Aceite (Lata)", basePrice: 1.65 },
  { name: "Sardinas en Tomate", basePrice: 1.30 },
  { name: "Tomate Rama 1kg", basePrice: 1.95 },
  { name: "Patatas 2kg", basePrice: 2.50 },
  { name: "Manzana Golden 1kg", basePrice: 2.20 },
  { name: "Plátano de Canarias 1kg", basePrice: 1.90 },
  { name: "Naranja de Mesa 1kg", basePrice: 1.80 },
  { name: "Yogur Natural Pack", basePrice: 1.65 },
  { name: "Queso Semicurado", basePrice: 4.10 },
  { name: "Queso Fresco", basePrice: 2.30 },
  { name: "Mantequilla", basePrice: 2.40 },
  { name: "Cereales Desayuno", basePrice: 2.90 },
  { name: "Galletas María", basePrice: 1.75 },
  { name: "Chocolate Negro", basePrice: 2.00 },
  { name: "Café Molido Natural", basePrice: 3.80 },
  { name: "Refresco de Cola", basePrice: 1.55 },
  { name: "Agua Mineral 1.5L", basePrice: 0.65 },
  { name: "Cerveza Rubia Pack", basePrice: 4.40 },
  { name: "Vino Tinto Joven", basePrice: 3.90 },
  { name: "Jamón Cocido", basePrice: 2.60 },
  { name: "Jamón Serrano", basePrice: 4.90 },
  { name: "Chorizo", basePrice: 2.20 },
  { name: "Salchichas Frescas", basePrice: 2.10 },
  { name: "Pizza Refrigerada", basePrice: 3.20 }
];

/* -------------------- SUPERMARKETS (SPAIN) -------------------- */

const supermarkets = [
  { name: "Mercadona", variation: 0.05 },
  { name: "Carrefour", variation: 0.08 },
  { name: "Alcampo", variation: 0.10 },
  { name: "Lidl", variation: 0.06 }
];

/* -------------------- PRICE GENERATOR -------------------- */

function calculatePrice(base, variation) {
  const factor = 1 + (Math.random() * variation * 2 - variation);
  return parseFloat((base * factor).toFixed(2));
}

/* -------------------- SEED FUNCTION -------------------- */

async function seed() {
  try {
    await Product.deleteMany({});
    console.log("🗑️ Old products deleted.");

    for (const product of products) {
      for (const market of supermarkets) {
        await Product.create({
          name: product.name,
          supermarket: market.name,
          price: calculatePrice(product.basePrice, market.variation)
        });
      }
    }

    console.log("✅ Spanish supermarket products seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seed();
