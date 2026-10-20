import { describe, expect, it } from "vitest";
import {
  canonicalDemoEmail,
  isDemoAffiliateEmail,
  isDemoCreatorEmail,
  isDemoFanEmail,
} from "./index";

describe("demo account aliases", () => {
  it("maps patrocino.com logins onto the canonical accounts", () => {
    expect(canonicalDemoEmail("fan@patrocino.com")).toBe("fan@mimelux.com.br");
    expect(isDemoFanEmail("fan@patrocino.com")).toBe(true);
    expect(canonicalDemoEmail("criadora@patrocino.com")).toBe("criadora@mimelux.com.br");
    expect(canonicalDemoEmail("creator@patrocino.com")).toBe("criadora@mimelux.com.br");
    expect(isDemoCreatorEmail("Criadora@Patrocino.com")).toBe(true);
    expect(canonicalDemoEmail("afiliado@patrocino.com")).toBe("afiliado@mimelux.com.br");
    expect(isDemoAffiliateEmail("afiliado@patrocino.com")).toBe(true);
  });

  it("keeps the earlier mimelux and fanmimo logins", () => {
    expect(canonicalDemoEmail("fan@mimelux.com.br")).toBe("fan@mimelux.com.br");
    expect(canonicalDemoEmail("fan@fanmimo.com.br")).toBe("fan@mimelux.com.br");
    expect(canonicalDemoEmail("creator@mimelux.com.br")).toBe("criadora@mimelux.com.br");
    expect(canonicalDemoEmail("afiliado@fanmimo.com")).toBe("afiliado@mimelux.com.br");
  });
});
