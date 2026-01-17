import { connectDB } from "../../lib/mongodb.js";
import User from "../../module/User.js";
import { generateGuestUser } from "../../lib/generate-guest.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

    try {
        await connectDB();

        let { email, password, isGuest } = req.body;

        if (isGuest) {
            const guest = generateGuestUser();
            email = guest.email;
            password = guest.password;
        }

        if (!email || !password) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }

        // Remove manual bcrypt hash, let Mongoose pre-save hook handle it
        const user = await User.create({
            email,
            password,
        });

        if (!user) {
            return res.status(500).json({ error: "User creation failed" });
        }
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || "dev_secret_key",
            { expiresIn: "7d" }
        );

        // Set token in cookie
        res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Path=/; Max-Age=604800`);

        res.status(201).json({
            id: user._id,
            email: user.email,
            isGuest: isGuest || false,
            role: user.role,
            token,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
