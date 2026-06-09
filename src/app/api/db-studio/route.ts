import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Initialize Prisma with the PG driver adapter matching the project pattern
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const MODELS_LIST = [
  "ObjectConfig",
  "SapTable",
  "SapField",
  "SapRelationship",
  "SyncLog",
  "SapDD08L",
  "SapDD02T",
  "SapTADIR",
  "SapTDEVC",
  "SapDF14T",
  "SapTLDB",
  "SapTLDBT",
  "SapDD02L",
  "SapDD03L",
  "SapLDBN",
  "SapTFDIR",
  "SapTFTIT",
  "SapDDLDEPENDENCY",
  "SapDDHEADANNO",
  "SapArItem",
  "SapApItem"
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const model = searchParams.get("model");

    // 1. If no model specified, list all models with count
    if (!model) {
      const modelsData = await Promise.all(
        MODELS_LIST.map(async (name) => {
          const client = (prisma as any)[name];
          if (!client) return { name, count: 0, error: "Not found in client" };
          try {
            const count = await client.count();
            return { name, count };
          } catch (e: any) {
            return { name, count: 0, error: e.message };
          }
        })
      );
      return NextResponse.json({ models: modelsData });
    }

    // 2. If model is specified, fetch its fields and records
    const client = (prisma as any)[model];
    if (!client) {
      return NextResponse.json({ error: `Model ${model} not found` }, { status: 404 });
    }

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "25");
    const skip = (page - 1) * pageSize;

    // Retrieve fields metadata from Prisma DMMF
    const modelMeta = Prisma.dmmf.datamodel.models.find(
      (m) => m.name.toLowerCase() === model.toLowerCase()
    );
    const fields = modelMeta ? modelMeta.fields : [];

    // Check if there is an updatedAt field to sort by default
    const hasUpdatedAt = fields.some((f) => f.name === "updatedAt");
    const orderBy = hasUpdatedAt ? { updatedAt: "desc" } : undefined;

    const [count, records] = await Promise.all([
      client.count(),
      client.findMany({
        skip,
        take: pageSize,
        orderBy,
      }).catch(async () => {
        // Fallback without orderBy
        return client.findMany({
          skip,
          take: pageSize,
        });
      }),
    ]);

    return NextResponse.json({
      model,
      count,
      page,
      pageSize,
      fields,
      records,
    });
  } catch (error: any) {
    console.error("Prisma Studio API Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while fetching database records." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { model, idField, idValue } = await req.json();

    if (!model || !idField || idValue === undefined) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const client = (prisma as any)[model];
    if (!client) {
      return NextResponse.json({ error: `Model ${model} not found` }, { status: 404 });
    }

    // Delete record
    const result = await client.delete({
      where: {
        [idField]: idValue,
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Prisma Studio API Delete Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete record." },
      { status: 500 }
    );
  }
}
