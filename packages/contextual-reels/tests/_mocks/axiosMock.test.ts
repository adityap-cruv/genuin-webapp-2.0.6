import { afterEach, describe, expect, it } from "vitest";

import { axiosMockFactory, resetAxiosMock, setAxiosResponse } from "./axiosMock";

describe("axiosMock", () => {
  afterEach(() => {
    resetAxiosMock();
  });

  it("returns a default {status:200, data:{}} when no matcher is registered", async () => {
    const axios = axiosMockFactory().default;
    const res = await axios.get("/anything");
    expect(res.status).toBe(200);
    expect(res.data).toEqual({});
  });

  it("matches by exact string", async () => {
    setAxiosResponse("/users", { status: 200, data: { id: "u1" } });
    const axios = axiosMockFactory().default;
    const res = await axios.get("/users");
    expect(res.data).toEqual({ id: "u1" });
  });

  it("matches by regex", async () => {
    setAxiosResponse(/\/items\/\d+/, { status: 200, data: { ok: true } });
    const axios = axiosMockFactory().default;
    const res = await axios.get("/items/42");
    expect(res.data).toEqual({ ok: true });
  });

  it("matches by predicate", async () => {
    setAxiosResponse((u: string) => u.startsWith("/api"), { status: 201, data: "created" });
    const axios = axiosMockFactory().default;
    const res = await axios.post("/api/widgets");
    expect(res.status).toBe(201);
  });

  it("create() returns an independent axios-like instance", () => {
    const axios = axiosMockFactory().default;
    const child = axios.create();
    expect(typeof child.get).toBe("function");
    expect(child).not.toBe(axios);
  });
});
