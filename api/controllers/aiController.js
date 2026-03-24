import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/productModel.js"; // your product model

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        // 🛑 validation
        if (!message || message.length < 2) {
            return res.json({ reply: "Please ask something meaningful." });
        }

        // 📦 fetch products from DB
        const products = await Product.find().limit(20);

        const productList = products
            .map(p => `${p.name} - Rs.${p.price}`)
            .join("\n");

        // 🤖 Gemini model
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });

        const result = await model.generateContent(`
You are an AI assistant for an eCommerce website called Quick Cart.

Available products:
${productList}

Rules:
- Recommend products only from the list
- Keep answers short and helpful
- If product not found, say politely

User: ${message}
`);

        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "Something went wrong" });
    }
};