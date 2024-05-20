import {mongooseConnect} from "@/Lib/mongoose";
import {Order} from "@/models/Order";

export default async function handler(req,res) {
  await mongooseConnect();
  res.json(await Order.find().sort({createdAt:-1}));
}