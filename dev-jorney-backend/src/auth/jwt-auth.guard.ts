//アクセスの制御を行う
import { CanActivate, Injectable, UnauthorizedException } from "@nestjs/common";
import { CognitoService } from "./jwt.strategy";
import { request, Request } from "express";

@Injectable()
export class AuthorizerGuard implements CanActivate {
    constructor(
        private readonly cognitoService: CognitoService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const { authorization } = request.headers;
        await this.authorizeByCognito(authorization);
        return true;
    }

    public async authorizeByCognito(authorizationToken?: string): Promise<void> {
        if (!authorizationToken) throw new UnauthorizedException('Authorization header is required');
        try{
            await this.cognitoService.getUserByToken(authorizationToken);
        } catch(e) {
            if(e.name === 'NotAuthorizedException') throw new UnauthorizedException('Invalid or expired token');
            throw e;
        } 
    }
}
