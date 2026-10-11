import { describe, expect, it } from "vitest";
import { filterCoupons, safeUrl, type Coupon } from "./types";

const coupon = (type: Coupon["type"], free_shipping = false) =>
  ({ type, free_shipping }) as Coupon;

describe("coupon helpers", () => {
  it("filters codes, deals and shipping offers", () => {
    const coupons = [coupon("code"), coupon("sale"), coupon("sale", true)];
    expect(filterCoupons(coupons, "Codes")).toHaveLength(1);
    expect(filterCoupons(coupons, "Deals")).toHaveLength(2);
    expect(filterCoupons(coupons, "Free shipping")).toHaveLength(1);
  });
  it("accepts web URLs and rejects unsafe protocols", () => {
    expect(safeUrl("https://example.com")).toBe("https://example.com/");
    expect(safeUrl("javascript:alert(1)")).toBeUndefined();
  });
});
