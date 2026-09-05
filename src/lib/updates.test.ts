import { describe, expect, it } from "vitest";
import { isUpdaterAuthError, previewStatusFromQuery, updateBannerText } from "./updates";

describe("update banner copy", () => {
  it("describes download and restart states", () => {
    expect(updateBannerText({ state: "available", version: "0.1.2" })).toBe(
      "Update 0.1.2 found — downloading…",
    );
    expect(updateBannerText({ state: "downloading", version: "0.1.2", percent: 41.6 })).toBe(
      "Downloading 0.1.2… 42%",
    );
    expect(updateBannerText({ state: "ready", version: "0.1.2" })).toBe("Update 0.1.2 is ready");
    expect(updateBannerText({ state: "needsToken" })).toMatch(/GitHub token/i);
  });

  it("reads a browser preview query", () => {
    expect(previewStatusFromQuery("?update=ready")).toEqual({ state: "ready", version: "9.9.9" });
    expect(previewStatusFromQuery("update=token")).toEqual({ state: "needsToken" });
    expect(previewStatusFromQuery("")).toBeNull();
  });

  it("treats private-repo lookup failures as auth errors", () => {
    expect(isUpdaterAuthError({ statusCode: 404, message: "Not Found" })).toBe(true);
    expect(isUpdaterAuthError(new Error("Cannot find channel latest.yml"))).toBe(true);
    expect(isUpdaterAuthError(new Error("ENOTFOUND"))).toBe(false);
  });
});
