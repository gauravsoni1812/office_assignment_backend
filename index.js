require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const mongoose = require("mongoose");
const Payment = require("./db/dbconfig.js"); // Import the database configuration and model

const app = express(); 
app.use(express.json());
app.use(cors());

app.post("/api/create-checkout-session", async (req, res) => {
  const { products } = req.body;
  const lineItems = products.map((product) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: product.dish,
        images: [product.imgdata],
      },
      unit_amount: product.price * 100,
    },
    quantity: product.qnty,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: lineItems.reduce((total, item) => total + item.price_data.unit_amount * item.quantity, 0),
      currency: "usd",
      payment_method_types: ["card"],
    });

    // Store payment details in database
    const payment = new Payment({
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      created: paymentIntent.created,
    });
    await payment.save();

    res.json({ id: session.id, paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(7000, () => {
  console.log("server start at 7000");
});
