import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { DynamoDBClient, PutItemCommand, UpdateItemCommand, GetItemCommand, ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { enquirySchema } from "@/lib/enquiry";

export const runtime = "nodejs";
const table = "rohitraj-tech-enquiries";
const client = new DynamoDBClient({ region: "ap-south-1" });
const unavailable = "Enquiries are temporarily unavailable. Please call, WhatsApp, or email Rohit directly.";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = new URL(request.url).origin;
  if (!origin || (origin !== host && origin !== "https://rohitraj.tech")) {
    return NextResponse.json({ success: false, error: "Please submit the form from this website." }, { status: 403 });
  }
  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > 10_000) return NextResponse.json({ success: false, error: "Your project brief is too long." }, { status: 413 });
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }
  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
  const { requestId, name, email, message, sourcePath } = parsed.data;
  const id = `enquiry:${requestId}`;
  try {
    // A retry uses the same receipt: no duplicate stored lead or notification.
    const previous = await client.send(new GetItemCommand({ TableName: table, Key: { id: { S: id } }, ConsistentRead: true }));
    if (previous.Item) return NextResponse.json({ success: true, receiptId: requestId });
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const hour = Math.floor(Date.now() / 3_600_000);
    const bucket = `rate:${createHash("sha256").update(`${hour}:${ip}`).digest("hex")}`;
    try {
      await client.send(new UpdateItemCommand({
        TableName: table, Key: { id: { S: bucket } },
        UpdateExpression: "SET expires_at = :expires ADD attempts :one",
        ConditionExpression: "attribute_not_exists(attempts) OR attempts < :limit",
        ExpressionAttributeValues: { ":expires": { N: String((hour + 2) * 3600) }, ":one": { N: "1" }, ":limit": { N: "5" } },
      }));
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) return NextResponse.json({ success: false, error: "Too many enquiries. Please contact me directly." }, { status: 429, headers: { "Retry-After": "3600" } });
      throw error;
    }
    try {
      await client.send(new PutItemCommand({
        TableName: table,
        Item: { id: { S: id }, name: { S: name }, email: { S: email }, message: { S: message }, source_path: { S: sourcePath }, received_at: { S: new Date().toISOString() }, expires_at: { N: String(Math.floor(Date.now() / 1000) + 90 * 86400) } },
        ConditionExpression: "attribute_not_exists(id)",
      }));
    } catch (error) {
      if (!(error instanceof ConditionalCheckFailedException)) throw error;
    }
    // The table stream delivers an email notification separately, with retries.
    return NextResponse.json({ success: true, receiptId: requestId });
  } catch (error) {
    console.error("[enquiry] storage unavailable", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ success: false, error: unavailable }, { status: 503 });
  }
}
