// app/api/verify-otp/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from 'redis';

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
let redisClient: any = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    redisClient.on('error', (err: Error) => {
      console.error('Redis Client Error:', err);
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

export async function POST(request: NextRequest) {
  try {
    const body: VerifyOTPRequestBody = await request.json();

    // Validate required fields
    if (!body.number || !body.otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!validatePhoneNumber(body.number)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Validate OTP format
    if (!validateOTP(body.otp)) {
      return NextResponse.json(
        { error: "Invalid OTP format. OTP must be 6 digits" },
        { status: 400 }
      );
    }

    // Get Redis client
    const redis = await getRedisClient();

    // Retrieve stored OTP data
    const otpKey = `otp:${body.number}`;
    const storedOTPData = await redis.get(otpKey);

    if (!storedOTPData) {
      return NextResponse.json(
        { 
          error: "OTP not found or expired",
          message: "Please request a new OTP"
        },
        { status: 404 }
      );
    }

    const otpData: OTPData = JSON.parse(storedOTPData);

    // Check if maximum attempts exceeded (prevent brute force)
    if (otpData.attempts >= 3) {
      // Delete the OTP after max attempts
      await redis.del(otpKey);
      return NextResponse.json(
        { 
          error: "Maximum verification attempts exceeded",
          message: "Please request a new OTP"
        },
        { status: 429 }
      );
    }

    // Check if OTP has expired (5 minutes = 300000 ms)
    const currentTime = Date.now();
    const otpAge = currentTime - otpData.createdAt;
    
    if (otpAge > 300000) {
      // Delete expired OTP
      await redis.del(otpKey);
      return NextResponse.json(
        { 
          error: "OTP has expired",
          message: "Please request a new OTP"
        },
        { status: 410 }
      );
    }

    // Check if OTP matches
    if (body.otp !== otpData.otp) {
      // Increment attempt counter
      const updatedOTPData: OTPData = {
        ...otpData,
        attempts: otpData.attempts + 1
      };
      
      await redis.setEx(otpKey, 300, JSON.stringify(updatedOTPData));
      
      const remainingAttempts = 3 - updatedOTPData.attempts;
      
      return NextResponse.json(
        { 
          error: "Invalid OTP",
          remaining_attempts: remainingAttempts,
          message: remainingAttempts > 0 
            ? `Invalid OTP. ${remainingAttempts} attempts remaining.`
            : "Invalid OTP. No attempts remaining."
        },
        { status: 401 }
      );
    }

    // OTP is valid - delete it from Redis (one-time use)
    await redis.del(otpKey);

    // Return success response
    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      phone_number: body.number,
      verified_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to check endpoint status
export async function GET() {
  return NextResponse.json({
    message: "Verify OTP API endpoint is working. Use POST method to verify OTP.",
    required_fields: ["number", "otp"],
    max_attempts: 3,
    otp_validity: "5 minutes",
    format: {
      number: "10-digit Indian mobile number",
      otp: "6-digit numeric code"
    }
  });
}