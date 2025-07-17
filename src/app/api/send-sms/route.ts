// app/api/send-sms/route.ts

import { NextRequest, NextResponse } from "next/server";

interface SMSRequestBody {
  header: string;
  template_id: string;
  numbers: string;
  variables_values?: string[];
  schedule_time?: string; // Expected format: DD-MM-YYYY-HH-MM
}

export async function POST(request: NextRequest) {
  try {
    const body: SMSRequestBody = await request.json();

    // Validate required fields
    if (!body.header || !body.template_id || !body.numbers) {
      return NextResponse.json(
        { error: "Missing required fields: sender_id, message, or numbers" },
        { status: 400 }
      );
    }

    // Fixed parameters
    const authorization = process.env.FAST2SMSKEY;
    const route = "dlt";
    const flash = "0";

    // Build URL parameters
    const params = new URLSearchParams({
      authorization,
      route,
      sender_id: body.header,
      message: body.template_id,
      flash,
      numbers: body.numbers,
    });

    // Handle variables_values - format as "value1|value2|"
    if (body.variables_values && body.variables_values.length > 0) {
      const formattedVariables = body.variables_values.join("|") + "|";
      params.append("variables_values", formattedVariables);
    }

    // Handle schedule_time - only add if provided
    if (body.schedule_time && body.schedule_time.trim() !== "") {
      // Validate format DD-MM-YYYY-HH-MM
      const timeRegex = /^\d{2}-\d{2}-\d{4}-\d{2}-\d{2}$/;
      if (!timeRegex.test(body.schedule_time)) {
        return NextResponse.json(
          { error: "Invalid schedule_time format. Expected: DD-MM-YYYY-HH-MM" },
          { status: 400 }
        );
      }
      params.append("schedule_time", body.schedule_time);
    }

    // Build the final URL
    const fast2smsUrl = `https://www.fast2sms.com/dev/bulkV2?${params.toString()}`;

    console.log("Calling Fast2SMS URL:", fast2smsUrl);

    // Make the API call to Fast2SMS
    const response = await fetch(fast2smsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Fast2SMS API error",
          details: responseData,
          status: response.status,
        },
        { status: response.status }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: responseData,
      request_url: fast2smsUrl, // For debugging purposes
    });
  } catch (error) {
    console.error("SMS API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to test the endpoint
export async function GET() {
  return NextResponse.json({
    message: "SMS API endpoint is working. Use POST method to send SMS.",
    required_fields: ["sender_id", "message", "numbers"],
    optional_fields: ["variables_values", "schedule_time"],
    schedule_time_format: "DD-MM-YYYY-HH-MM",
    variables_format: 'Array of strings, will be formatted as "value1|value2|"',
  });
}
