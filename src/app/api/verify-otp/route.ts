// app/api/verify-otp/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "redis";

interface VerifyOTPRequestBody {
  number: string;
  otp: string;
}

interface OTPData {
  otp: string;
  attempts: number;
  createdAt: number;
}

// Initialize Redis client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redisClient: any = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    redisClient.on("error", (err: Error) => {
      console.error("Redis Client Error:", err);
    });

    await redisClient.connect();
  }
  return redisClient;
}

// Validate phone number format
function validatePhoneNumber(number: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
  return phoneRegex.test(number);
}

// Validate OTP format
function validateOTP(otp: string): boolean {
  const otpRegex = /^\d{6}$/; // 6-digit numeric OTP
  return otpRegex.test(otp);
}

// CORS configuration with multiple origins
function setCorsHeaders(response: NextResponse, request: NextRequest) {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://alilals.com",
    "https://www.alilals.com",
    // Add more origins as needed
  ];

  const origin = request.headers.get("origin");

  // Check if the origin is in the allowed list
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
  return response;
}

// Handle preflight OPTIONS request
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return setCorsHeaders(response, request);
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyOTPRequestBody = await request.json();

    // Validate required fields
    if (!body.number || !body.otp) {
      const response = NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
      return setCorsHeaders(response, request);
    }

    // Validate phone number format
    if (!validatePhoneNumber(body.number)) {
      const response = NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
      return setCorsHeaders(response, request);
    }

    // Validate OTP format
    if (!validateOTP(body.otp)) {
      const response = NextResponse.json(
        { error: "Invalid OTP format. OTP must be 6 digits" },
        { status: 400 }
      );
      return setCorsHeaders(response, request);
    }

    // Get Redis client
    const redis = await getRedisClient();

    // Retrieve stored OTP data
    const otpKey = `otp:${body.number}`;
    const storedOTPData = await redis.get(otpKey);

    if (!storedOTPData) {
      const response = NextResponse.json(
        {
          error: "OTP not found or expired",
          message: "Please request a new OTP",
        },
        { status: 404 }
      );
      return setCorsHeaders(response, request);
    }

    const otpData: OTPData = JSON.parse(storedOTPData);

    // Check if maximum attempts exceeded (prevent brute force)
    if (otpData.attempts >= 3) {
      // Delete the OTP after max attempts
      await redis.del(otpKey);
      const response = NextResponse.json(
        {
          error: "Maximum verification attempts exceeded",
          message: "Please request a new OTP",
        },
        { status: 429 }
      );
      return setCorsHeaders(response, request);
    }

    // Check if OTP has expired (5 minutes = 300000 ms)
    const currentTime = Date.now();
    const otpAge = currentTime - otpData.createdAt;

    if (otpAge > 300000) {
      // Delete expired OTP
      await redis.del(otpKey);
      const response = NextResponse.json(
        {
          error: "OTP has expired",
          message: "Please request a new OTP",
        },
        { status: 410 }
      );
      return setCorsHeaders(response, request);
    }

    // Check if OTP matches
    if (body.otp !== otpData.otp) {
      // Increment attempt counter
      const updatedOTPData: OTPData = {
        ...otpData,
        attempts: otpData.attempts + 1,
      };

      await redis.setEx(otpKey, 300, JSON.stringify(updatedOTPData));

      const remainingAttempts = 3 - updatedOTPData.attempts;

      const response = NextResponse.json(
        {
          error: "Invalid OTP",
          remaining_attempts: remainingAttempts,
          message:
            remainingAttempts > 0
              ? `Invalid OTP. ${remainingAttempts} attempts remaining.`
              : "Invalid OTP. No attempts remaining.",
        },
        { status: 401 }
      );
      return setCorsHeaders(response, request);
    }

    // OTP is valid - delete it from Redis (one-time use)
    await redis.del(otpKey);

    // Return success response
    const response = NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      phone_number: body.number,
      verified_at: new Date().toISOString(),
    });
    return setCorsHeaders(response, request);
  } catch (error) {
    console.error("Verify OTP Error:", error);
    const response = NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
    return setCorsHeaders(response, request);
  }
}

// Optional: Add GET method to check endpoint status
export async function GET(request: NextRequest) {
  const response = NextResponse.json({
    message:
      "Verify OTP API endpoint is working. Use POST method to verify OTP.",
    required_fields: ["number", "otp"],
    max_attempts: 3,
    otp_validity: "5 minutes",
    format: {
      number: "10-digit Indian mobile number",
      otp: "6-digit numeric code",
    },
  });
  return setCorsHeaders(response, request);
}
