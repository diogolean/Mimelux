import { Body, Controller, HttpCode, Module, Post, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { database } from "@mimelux/db/runtime";

const demoEmailAliases: Record<string, string> = {
  "creator@mimelux.com.br": "criadora@mimelux.com.br",
  "creator@patrocino.com": "criadora@mimelux.com.br",
  "criadora@patrocino.com": "criadora@mimelux.com.br",
  "fan@patrocino.com": "fan@mimelux.com.br",
  "afiliado@patrocino.com": "afiliado@mimelux.com.br",
  "creator@fanmimo.com": "criadora@mimelux.com.br",
  "creator@fanmimo.com.br": "criadora@mimelux.com.br",
  "criadora@fanmimo.com": "criadora@mimelux.com.br",
  "criadora@fanmimo.com.br": "criadora@mimelux.com.br",
  "fan@fanmimo.com": "fan@mimelux.com.br",
  "fan@fanmimo.com.br": "fan@mimelux.com.br",
  "afiliado@fanmimo.com": "afiliado@mimelux.com.br",
  "afiliado@fanmimo.com.br": "afiliado@mimelux.com.br",
};

function canonicalDemoEmail(email: string) {
  const value = email.trim().toLowerCase();
  return demoEmailAliases[value] ?? value;
}
import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(120),
});
const registerSchema = credentialsSchema.extend({
  name: z.string().min(2).max(80),
  role: z.enum(["FAN", "CREATOR", "AFFILIATE"]).default("FAN"),
});
const refreshSchema = z.object({ refreshToken: z.string().min(20) });

function issueTokens(user: { id: string; email: string; role: string }) {
  const accessSecret = process.env.JWT_ACCESS_SECRET ?? "local-access-only";
  const refreshSecret = process.env.JWT_REFRESH_SECRET ?? "local-refresh-only";
  return {
    accessToken: sign({ sub: user.id, email: user.email, role: user.role }, accessSecret, { expiresIn: "15m" }),
    refreshToken: sign({ sub: user.id, type: "refresh" }, refreshSecret, { expiresIn: "30d" }),
    tokenType: "Bearer",
    expiresIn: 900,
  };
}

@ApiTags("auth")
@Controller("auth")
class AuthController {
  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Authenticate with credentials and return native-ready tokens" })
  async login(@Body() body: unknown) {
    const input = credentialsSchema.parse(body);
    const user = await database.user.findUnique({
      where: { email: canonicalDemoEmail(input.email) },
    });
    if (!user || !(await compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return { user: { id: user.id, email: user.email, role: user.role }, ...issueTokens(user) };
  }

  @Post("register")
  @ApiOperation({ summary: "Register a test user and return token pair" })
  async register(@Body() body: unknown) {
    const input = registerSchema.parse(body);
    const user = await database.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash: await hash(input.password, 12),
        role: input.role,
        profile: { create: { name: input.name, username: `user-${Date.now()}` } },
      },
    });
    return { user: { id: user.id, email: user.email, role: user.role }, ...issueTokens(user) };
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Body() body: unknown) {
    const { refreshToken } = refreshSchema.parse(body);
    try {
      const payload = verify(refreshToken, process.env.JWT_REFRESH_SECRET ?? "local-refresh-only") as { sub: string; type?: string };
      if (payload.type !== "refresh") throw new Error("Invalid token type");
      const user = await database.user.findUniqueOrThrow({ where: { id: payload.sub } });
      return issueTokens(user);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  @Post("verify-email")
  @HttpCode(501)
  verifyEmail() {
    return { code: "NOT_IMPLEMENTED", mode: "contract-only" };
  }
}

@Module({ controllers: [AuthController] })
export class AuthModule {}
