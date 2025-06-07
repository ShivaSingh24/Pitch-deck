import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";

// Configure Cloudinary with your credentials
cloudinary.v2.config({
  cloud_name: "dfq7tpkep",
  api_key: "524777251618552",
  api_secret: "TSElZuiWJJ7Waw4k63QRB1Qojv4",
  secure: true,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResult.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload(dataUrl, {
      resource_type: "auto",
    });

    const url = result.secure_url;
    return NextResponse.json({ url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
