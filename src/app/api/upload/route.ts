import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload directory in the public folder
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        
        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        // Generate safe unique filename
        const ext = path.extname(file.name);
        const nameWithoutExt = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, "_");
        const filename = `${nameWithoutExt}_${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/${filename}`;
        return NextResponse.json({ url: fileUrl });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
