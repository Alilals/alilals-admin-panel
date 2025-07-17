// app/api/get-templates/route.ts

import { NextRequest, NextResponse } from "next/server";
import templates from "./template";

export interface TemplateEntry {
  template: string;
  "variable-count": number;
}

export interface TemplateMap {
  [header: string]: TemplateEntry[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dltHeader = searchParams.get("dltHeader");

  if (!dltHeader || typeof dltHeader !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid dltHeader parameter" },
      { status: 400 }
    );
  }

  const result = templates[dltHeader];

  if (result) {
    return NextResponse.json({ [dltHeader]: result }, { status: 200 });
  } else {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
}
