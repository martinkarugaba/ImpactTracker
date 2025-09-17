"use server";

import { signIn } from "@/features/auth/auth";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { nanoid } from "nanoid";
import { createTransport } from "nodemailer";

// Email configuration
const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function login(email: string, password: string) {
  try {
    console.log("=== LOGIN FUNCTION CALLED ===");
    console.log("Email:", email);
    console.log("Password provided:", !!password);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    console.log("SignIn result:", result);

    // Check if signIn returned an error
    if (result?.error) {
      console.error("SignIn error:", result.error);
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Check if signIn was successful
    if (result?.ok) {
      console.log("Login successful");
      return { success: true };
    }

    // If we get here, something unexpected happened
    console.error("Unexpected signIn result:", result);
    return {
      success: false,
      error: "An unexpected error occurred during login",
    };
  } catch (error) {
    console.error("Login error:", error);

    // Check if it's a specific NextAuth error
    if (error instanceof Error) {
      if (error.message.includes("CredentialsSignin")) {
        return {
          success: false,
          error: "Invalid email or password",
        };
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred during login",
    };
  }
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existingUser) {
      return {
        success: false,
        error: "A user with this email already exists",
      };
    }

    // Hash password
    const hashedPassword = await hash(data.password, 10);

    // Create user
    // Note: We use "user" as the database role, but in the application
    // logic, we treat new users as basic users until they are added to an organization.
    // This avoids having to modify the database enum type.
    const [user] = await db
      .insert(users)
      .values({
        id: nanoid(),
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "user",
      })
      .returning();

    revalidatePath("/auth/login");
    return { success: true, data: user };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during registration",
    };
  }
}

export async function requestPasswordReset(email: string) {
  try {
    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // Return success even if user doesn't exist for security
      return { success: true };
    }

    // Generate reset token
    const token = nanoid(32);
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

    // Save token to database
    await db.insert(passwordResetTokens).values({
      token,
      user_id: user.id,
      expires,
    });

    try {
      // Send reset email
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${token}`;
      await transporter.sendMail({
        from: `"KPI Tracking" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: "Reset your KPI Tracking password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your KPI Tracking account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4f46e5;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="color: #667; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
          </div>
        `,
      });

      return { success: true };
    } catch (emailError) {
      console.error("Error sending reset email:", emailError);
      // Return the token so it can be displayed to the user
      return {
        success: false,
        error: "Failed to send reset email",
        token,
      };
    }
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return {
      success: false,
      error: "Failed to request password reset",
    };
  }
}

export async function verifyResetToken(token: string) {
  try {
    const resetToken = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.token, token),
    });

    if (!resetToken) {
      return false;
    }

    // Check if token has expired
    if (new Date() > resetToken.expires) {
      // Delete expired token
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.token, token));
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error verifying reset token:", error);
    return false;
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    // Find valid token
    const resetToken = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.token, token),
    });

    if (!resetToken || new Date() > resetToken.expires) {
      return {
        success: false,
        error: "Invalid or expired reset token",
      };
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update user's password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, resetToken.user_id));

    // Delete used token
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));

    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return {
      success: false,
      error: "Failed to reset password",
    };
  }
}
