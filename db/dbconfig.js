const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("connection successfull")
}).catch((error)=>{
    console.log("connection error",error)
});

const paymentSchema = new mongoose.Schema({
  paymentIntentId: String,
  amount: Number,
  currency: String,
  status: String,
  created: Date,
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
