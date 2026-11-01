import { describe, expect, it } from "vitest";
import { matchesPilotOwner } from "./pilot-identity";

const owner = "aab6e5ea-87c5-47b3-b469-89813d4771e0";
describe("private Manus pilot owner allowlist", () => {
  it("accepts an exact Supabase owner UUID", () => {
    expect(matchesPilotOwner(owner, null, owner)).toBe(true);
    expect(matchesPilotOwner(owner, null, "bba6e5ea-87c5-47b3-b469-89813d4771e0")).toBe(false);
  });
  it("accepts a verified account email without requiring users to copy a UUID", () => {
    expect(matchesPilotOwner(owner, "OWNER@example.com", "owner@example.com")).toBe(true);
  });
  it("rejects unverified or absent email identity, including anonymous sessions", () => {
    expect(matchesPilotOwner(owner, null, "owner@example.com")).toBe(false);
    expect(matchesPilotOwner(owner, undefined, "owner@example.com")).toBe(false);
    expect(matchesPilotOwner(owner, "other@example.com", "owner@example.com")).toBe(false);
  });
  it("rejects empty/invalid allowlists rather than granting universal access", () => {
    for(const allow of ["", " ", "@example.com", "*", "owner", undefined]) {
      expect(matchesPilotOwner(owner,"owner@example.com", allow)).toBe(false);
    }
  });
});
