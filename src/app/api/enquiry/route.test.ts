/** @jest-environment node */
import { POST } from "./route";
import { GetItemCommand, PutItemCommand, UpdateItemCommand, ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

const send = jest.fn();
jest.mock("@aws-sdk/client-dynamodb", () => {
  const actual = jest.requireActual("@aws-sdk/client-dynamodb");
  return { ...actual, DynamoDBClient: jest.fn(() => ({ send: (...args: unknown[]) => send(...args) })) };
});

const brief = { requestId: "d9a494e4-b663-42d2-9a60-f62727096535", name: "A founder", email: "founder@example.com", message: "Build an AI support agent for our team.", sourcePath: "/services/fractional-ai-engineer", website: "" };
function request(body: unknown = brief, origin = "https://rohitraj.tech") {
  return new Request("https://rohitraj.tech/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json", origin, "x-forwarded-for": "192.0.2.1" }, body: JSON.stringify(body) });
}

beforeEach(() => { send.mockReset(); send.mockResolvedValue({}); });

it("confirms receipt only after persisting the valid enquiry", async () => {
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ success: true, receiptId: brief.requestId });
  const put = send.mock.calls.find(([command]) => command instanceof PutItemCommand)?.[0];
  expect(put.input.Item.email.S).toBe(brief.email);
  expect(put.input.Item.message.S).toBe(brief.message);
  expect(put.input.ConditionExpression).toBe("attribute_not_exists(id)");
});

it("does not claim a lead was received if storage fails", async () => {
  send.mockImplementation(command => command instanceof PutItemCommand ? Promise.reject(new Error("outage")) : Promise.resolve({}));
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  const response = await POST(request());
  expect(response.status).toBe(503);
  expect((await response.json()).success).toBe(false);
  log.mockRestore();
});

it("accepts a retried receipt without a duplicate lead or rate-limit charge", async () => {
  send.mockResolvedValueOnce({ Item: { id: { S: `enquiry:${brief.requestId}` } } });
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toBeInstanceOf(GetItemCommand);
});

it.each([{ ...brief, email: "not-an-email" }, { ...brief, message: "short" }, { ...brief, website: "spam.example" }, { ...brief, sourcePath: "/contact?email=private@example.com" }])("rejects invalid/spam submissions before storage", async body => {
  const response = await POST(request(body));
  expect(response.status).toBe(400);
  expect(send).not.toHaveBeenCalled();
});

it("rejects submissions from another website", async () => {
  const response = await POST(request(brief, "https://other.example"));
  expect(response.status).toBe(403);
  expect(send).not.toHaveBeenCalled();
});

it("returns a clear limit response rather than persisting another lead", async () => {
  send.mockImplementation(command => command instanceof UpdateItemCommand ? Promise.reject(new ConditionalCheckFailedException({ message: "rate limited", $metadata: {} })) : Promise.resolve({}));
  const response = await POST(request());
  expect(response.status).toBe(429);
  expect(send.mock.calls.some(([command]) => command instanceof PutItemCommand)).toBe(false);
});
