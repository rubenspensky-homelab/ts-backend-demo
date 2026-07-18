import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("CORS", () => {
  it("allows configured origins", async () => {
    const res = await request(app).get("/health").set("Origin", "http://localhost:5173");

    expect(res.status).toBe(200);
    expect(res.header["access-control-allow-origin"]).toBe("http://localhost:5173");
  });

  it("does not allow unconfigured origins", async () => {
    const res = await request(app).get("/health").set("Origin", "https://unknown.example.test");

    expect(res.status).toBe(200);
    expect(res.header["access-control-allow-origin"]).toBeUndefined();
  });
});
