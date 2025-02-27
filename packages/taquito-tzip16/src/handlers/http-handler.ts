import { HttpBackend } from "@exodus/taquito-http-utils";
import { ContractAbstraction, ContractProvider, Wallet, Context } from "@exodus/taquito-taquito";
import { Handler, Tzip16Uri } from "../metadata-provider";

export class HttpHandler implements Handler {
    httpBackend: HttpBackend;
    constructor() {
        this.httpBackend = new HttpBackend();
    }
    async getMetadata(_contractAbstraction: ContractAbstraction<ContractProvider | Wallet>, { protocol, location }: Tzip16Uri, _context: Context) {
        return this.httpBackend.createRequest<string>({
            url: `${protocol}:${decodeURIComponent(location)}`,
            method: 'GET',
            headers: {
              'Content-Type': 'text/plain; charset=utf-8'
            },
            json: false
        })
    }
}