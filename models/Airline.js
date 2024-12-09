import mongoose from "mongoose";

const airlineSchema = new mongoose.Schema(
  {
    
  },
  { timestamps: true }
);

export default mongoose.model("Airline", airlineSchema);
