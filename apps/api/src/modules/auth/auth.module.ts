import { Body, Controller, HttpCode, Module, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("auth")
@Controller("auth")
class AuthController {
  @Post("login")
  @HttpCode(501)
  @ApiOperation({ summary: "Authenticate with credentials (contract only in V0.1)" })
  login(@Body() _body: unknown) {
    return { code: "NOT_IMPLEMENTED", mode: "contract-only" };
  }

  @Post("register")
  @HttpCode(501)
  @ApiOperation({ summary: "Register a user (contract only in V0.1)" })
  register(@Body() _body: unknown) {
    return { code: "NOT_IMPLEMENTED", mode: "contract-only" };
  }

  @Post("refresh")
  @HttpCode(501)
  refresh() {
    return { code: "NOT_IMPLEMENTED", mode: "contract-only" };
  }

  @Post("verify-email")
  @HttpCode(501)
  verifyEmail() {
    return { code: "NOT_IMPLEMENTED", mode: "contract-only" };
  }
}

@Module({ controllers: [AuthController] })
export class AuthModule {}
