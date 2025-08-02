// app/api/send-otp/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from 'redis';

interface SendOTPRequestBody {
  number: string;
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

// Generate random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate phone number format (basic validation)
function validatePhoneNumber(number: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
  return phoneRegex.test(number);
}

export async function POST(request: NextRequest) {
  try {
    const body: SendOTPRequestBody = await request.json();

    // Validate required fields
    if (!body.number) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!validatePhoneNumber(body.number)) {
      return NextResponse.json(
        { error: "Invalid phone number format. Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    console.log(`Generated OTP for ${body.number}: ${otp}`); // For debugging - remove in production

    // Get Redis client
    const redis = await getRedisClient();

    // Check if there's an existing OTP for this number
    const existingOTPKey = `otp:${body.number}`;
    const existingOTP = await redis.get(existingOTPKey);
    
    if (existingOTP) {
      const otpData: OTPData = JSON.parse(existingOTP);
      const timeSinceCreated = Date.now() - otpData.createdAt;
      
      // If OTP was created less than 60 seconds ago, prevent spam
      if (timeSinceCreated < 60000) {
        const remainingTime = Math.ceil((60000 - timeSinceCreated) / 1000);
        return NextResponse.json(
          { 
            error: `Please wait ${remainingTime} seconds before requesting a new OTP`,
            remainingTime 
          },
          { status: 429 }
        );
      }
    }

    // Store OTP in Redis with 5-minute expiration
    const otpData: OTPData = {
      otp,
      attempts: 0,
      createdAt: Date.now()
    };

    await redis.setEx(existingOTPKey, 300, JSON.stringify(otpData)); // 5 minutes expiration

    // Prepare SMS data using your existing DLT template
    const smsData = {
      header: 'ZIRAAT', 
      template_id: "191100", 
      numbers: body.number,
      variables_values: [otp], 
    };

    // Call your existing SMS API
    const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'}/api/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smsData),
    });

    const smsResult = await smsResponse.json();

    if (!smsResponse.ok) {
      // If SMS failed, clean up the stored OTP
      await redis.del(existingOTPKey);
      
      return NextResponse.json(
        {
          error: "Failed to send OTP SMS",
          details: smsResult.error || "SMS service error",
        },
        { status: 500 }
      );
    }

    // Return success response (don't include actual OTP in production)
    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      phone_number: body.number,
      expires_in: 300, // 5 minutes in seconds
      // otp: otp, // Only for development - REMOVE in production
    });

  } catch (error) {
    console.error("Send OTP Error:", error);
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
    message: "Send OTP API endpoint is working. Use POST method to send OTP.",
    required_fields: ["number"],
    otp_validity: "5 minutes",
    rate_limit: "1 OTP per 60 seconds per number",
  });
}