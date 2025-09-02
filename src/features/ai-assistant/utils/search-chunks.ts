// src/features/ai-assistant/utils/search-chunks.ts
import { db } from "@/db/conn";
import { sql } from "drizzle-orm";
import { chunks } from "@/db/schema"; // import your table schema

export async function searchChunks(
  queryEmbedding: number[],
  documentId: string,
  k = 5,
  expectedDim = 768
) {
  try {
    // basic validation
    if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
      throw new Error("queryEmbedding must be a non-empty array");
    }
    if (queryEmbedding.length !== expectedDim) {
      console.warn(
        `[searchChunks] embedding length ${queryEmbedding.length} != expected ${expectedDim}`
      );
    }

    const docIdTrimmed = String(documentId).trim();

    // Quick existence check using Drizzle table prop (works with uuid typed column)
    // We'll try both direct equality and text equality (safer if driver/DB type issues exist).
    const sample = await db
      .select({
        id: chunks.id,
        docText: sql`document_id::text`,
        content: chunks.content,
      })
      .from(chunks)
      .where(sql`document_id::text = ${docIdTrimmed}`)
      .limit(1);

    if (!sample || sample.length === 0) {
      console.warn(
        `[searchChunks] no rows matched document_id::text = ${docIdTrimmed}`
      );
    } else {
      console.log(
        "[searchChunks] found sample row for documentId:",
        sample[0].id,
        String(sample[0].docText).slice(0, 50)
      );
    }

    // Build safe vector literal as a single SQL fragment
    const safeNums = queryEmbedding.map((n) => {
      if (!Number.isFinite(n)) throw new Error("Embedding contains non-finite value");
      return Number(n).toString();
    });
    const embeddingLiteral = `[${safeNums.join(",")}]`;

    // Run similarity query using a single vector literal; compare on document_id::text for robustness
    let simRes;
    try {
      simRes = await db.execute(
        sql`
          SELECT id, content, embedding <-> ${sql.raw(`'${embeddingLiteral}'::vector`)} AS distance
          FROM chunks
          WHERE document_id::text = ${docIdTrimmed}
          ORDER BY distance ASC
          LIMIT ${k};
        `
      );
    } catch (err) {
      console.error("[searchChunks] similarity query failed:", err);
      simRes = null;
    }

    const simRows = (simRes as any)?.rows ?? simRes ?? [];

    if (simRows && simRows.length > 0) {
      return simRows.map((r: any) => ({
        id: String(r.id),
        content: r.content ?? "",
        distance: Number(r.distance),
      }));
    }

    // similarity returned nothing — fallback to most recent k by created_at (or id if no created_at)
    const fallback = await db.execute(
      sql`
        SELECT id, content, NULL::float AS distance
        FROM chunks
        WHERE document_id::text = ${docIdTrimmed}
        ORDER BY created_at DESC
        LIMIT ${k};
      `
    );
    const fallbackRows = (fallback as any).rows ?? fallback ?? [];

    return (fallbackRows as any[]).map((r) => ({
      id: String(r.id),
      content: r.content ?? "",
      distance: Number.isFinite(r.distance) ? Number(r.distance) : Number.POSITIVE_INFINITY,
    }));
  } catch (err) {
    console.error("[searchChunks] unexpected error:", err);
    return [];
  }
}
