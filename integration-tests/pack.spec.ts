import { CONFIGS } from "./config";
import { TezosToolkit } from "@taquito/taquito";
import { MichelsonType, MichelsonData, ProtocolID, packDataBytes } from "@taquito/michel-codec";
import { MichelsonV1Expression } from "@taquito/rpc";
import fs from "fs";
import path from "path";

interface TypedTestData {
    type?: MichelsonType;
    data: MichelsonData;
    expect?: MichelsonData;
    packed: string;
    proto?: ProtocolID;
}

CONFIGS().forEach(({ rpc, protocol }) => {
    const Tezos = new TezosToolkit(rpc);

    describe(`Test binary encoding: ${rpc}`, () => {
        const files = [
            'binary-data1.json',
            'binary-data3.json'
        ];
        const paths = files.map((f) => path.resolve(import.meta.dirname, `../packages/taquito-michel-codec/test/${f}`));
        const src: TypedTestData[] = [].concat(
            ...paths.map((p) => JSON.parse(fs.readFileSync(p).toString()))
        );

        describe("Test pack", () => {
            for (const s of src) {
                const def = (s.proto === undefined || s.proto === protocol) ? test : test.skip;
                def(`Verify that .pack for local pack will return same result as for network pack: ${JSON.stringify(s.data)} (${rpc})`, async () => {
                    const local = packDataBytes(s.data, s.type);
                    const rpcResult = await Tezos.rpc.packData({ data: s.data, type: s.type as MichelsonV1Expression }, { block: "head" })
                    expect(local.bytes).toEqual(rpcResult.packed);
                
                });
            }
        });
    });
})
