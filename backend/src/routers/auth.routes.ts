import { Router } from "express";
import { User } from "../models/User";

const router = Router();

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { username, role, password } = req.body;

    const user = await User.findOne({
      where: { username, role, password }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    return res.json({ 
      success: true, 
      id: user.get('id'), 
      role: user.get('role') 
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Signup endpoint
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ 
      where: { username } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Username already exists" 
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ 
      where: { email } 
    });
    
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already registered" 
      });
    }

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password, // In production, hash this with bcrypt!
      role: role === 'influencer' ? 'influencer' : 'donor'
    });

    return res.json({ 
      success: true, 
      id: newUser.get('id'), 
      role: newUser.get('role'),
      message: "Account created successfully"
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

export default router;