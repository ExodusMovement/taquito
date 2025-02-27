import LambdaView from '../../src/contract/lambda-view';
import { TezosToolkit } from '../../src/taquito';
import { entrypoints, script } from './data-lambda-view-class';

describe('LambdaView test', () => {
  let mockRpcClientView: any;
  let mockRpcClientLambda: any;
  let toolkitView: TezosToolkit;
  let toolkitLambda: TezosToolkit;

  beforeEach(() => {
    mockRpcClientView = {
      getContract: jest.fn(),
      getChainId: jest.fn(),
      getEntrypoints: jest.fn(),
    };

    mockRpcClientView.getContract.mockResolvedValue({ script });
    mockRpcClientView.getChainId.mockResolvedValue('NetXjD3HPJJjmcd');

    toolkitView = new TezosToolkit(mockRpcClientView);

    mockRpcClientLambda = {
      getContract: jest.fn(),
      getChainId: jest.fn(),
      getEntrypoints: jest.fn(),
    };

    mockRpcClientLambda.getContract.mockResolvedValue({
      script: {
        code: [
          {
            prim: 'parameter',
            args: [
              {
                prim: 'lambda',
                args: [
                  { prim: 'unit' },
                  {
                    prim: 'pair',
                    args: [{ prim: 'list', args: [{ prim: 'operation' }] }, { prim: 'unit' }],
                  },
                ],
              },
            ],
          },
          { prim: 'storage', args: [{ prim: 'unit' }] },
          {
            prim: 'code',
            args: [[{ prim: 'CAR' }, { prim: 'UNIT' }, { prim: 'EXEC' }]],
          },
        ],
        storage: { prim: 'Unit' },
      },
    });
    mockRpcClientLambda.getChainId.mockResolvedValue('NetXjD3HPJJjmcd');
    mockRpcClientLambda.getEntrypoints.mockResolvedValue({ entrypoints: {} });

    toolkitLambda = new TezosToolkit(mockRpcClientLambda);
  });

  it('LambdaView is instantiable with parameters', async () => {
    mockRpcClientView.getEntrypoints.mockResolvedValue(entrypoints);
    const viewContract = await toolkitView.contract.at('KT1A87ZZL8mBKcWGr34BVsERPCJjfX82iBto');
    const lambdaContract = await toolkitLambda.contract.at('KT1VAy1o1FGiXYfD3YT7x7k5eF5HSHhmc1u6');

    expect(new LambdaView(lambdaContract, viewContract, 'getAllowance')).toBeInstanceOf(LambdaView);

    expect(
      new LambdaView(lambdaContract, viewContract, 'getAllowance', {
        prim: 'Pair',
        args: [
          { string: 'tz1c1X8vD4pKV9TgV1cyosR7qdnkc8FTEyM1' },
          { string: 'tz1Nu949TjA4zzJ1iobz76fHPZbWUraRVrCE' },
        ],
      })
    ).toBeInstanceOf(LambdaView);


  });

  it('Should create a valid voidLambda', async () => {
    mockRpcClientView.getEntrypoints.mockResolvedValue(entrypoints);
    const viewContract = await toolkitView.contract.at('KT1A87ZZL8mBKcWGr34BVsERPCJjfX82iBto');
    const lambdaContract = await toolkitLambda.contract.at('KT1VAy1o1FGiXYfD3YT7x7k5eF5HSHhmc1u6');

    const lambda = new LambdaView(lambdaContract, viewContract, 'getAllowance', {
      prim: 'Pair',
      args: [
        { string: 'tz1c1X8vD4pKV9TgV1cyosR7qdnkc8FTEyM1' },
        { string: 'tz1Nu949TjA4zzJ1iobz76fHPZbWUraRVrCE' },
      ],
    });

    expect(lambda.voidLambda).toEqual([
      { prim: 'PUSH', args: [{ prim: 'mutez' }, { int: '0' }] },
      { prim: 'NONE', args: [{ prim: 'key_hash' }] },
      {
        prim: 'CREATE_CONTRACT',
        args: [
          [
            { prim: 'parameter', args: [{ prim: 'nat' }] },
            { prim: 'storage', args: [{ prim: 'unit' }] },
            {
              prim: 'code',
              args: [[{ prim: 'CAR' }, { prim: 'FAILWITH' }]],
            },
          ],
        ],
      },
      {
        prim: 'DIP',
        args: [
          [
            {
              prim: 'DIP',
              args: [
                [
                  {
                    prim: 'LAMBDA',
                    args: [
                      {
                        prim: 'pair',
                        args: [{ prim: 'address' }, { prim: 'unit' }],
                      },
                      {
                        prim: 'pair',
                        args: [{ prim: 'list', args: [{ prim: 'operation' }] }, { prim: 'unit' }],
                      },
                      [
                        { prim: 'CAR' },
                        { prim: 'CONTRACT', args: [{ prim: 'nat' }] },
                        {
                          prim: 'IF_NONE',
                          args: [
                            [
                              {
                                prim: 'PUSH',
                                args: [{ prim: 'string' }, { string: `Callback type unmatched` }],
                              },
                              { prim: 'FAILWITH' },
                            ],
                            [],
                          ],
                        },
                        {
                          prim: 'PUSH',
                          args: [
                            {
                              prim: 'pair',
                              args: [
                                {
                                  prim: 'address',
                                },
                                {
                                  prim: 'address',
                                },
                              ],
                            },
                            {
                              prim: 'Pair',
                              args: [
                                {
                                  string: 'tz1c1X8vD4pKV9TgV1cyosR7qdnkc8FTEyM1',
                                },
                                {
                                  string: 'tz1Nu949TjA4zzJ1iobz76fHPZbWUraRVrCE',
                                },
                              ],
                            },
                          ],
                        },
                        { prim: 'PAIR' },
                        {
                          prim: 'DIP',
                          args: [
                            [
                              {
                                prim: 'PUSH',
                                args: [
                                  { prim: 'address' },
                                  {
                                    string: `KT1A87ZZL8mBKcWGr34BVsERPCJjfX82iBto%getAllowance`,
                                  },
                                ],
                              },
                              { prim: 'DUP' },
                              {
                                prim: 'CONTRACT',
                                args: [
                                  {
                                    prim: 'pair',
                                    args: [
                                      {
                                        prim: 'pair',
                                        args: [
                                          {
                                            prim: 'address',
                                          },
                                          {
                                            prim: 'address',
                                          },
                                        ],
                                      },
                                      {
                                        prim: 'contract',
                                        args: [{ prim: 'nat' }],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                prim: 'IF_NONE',
                                args: [
                                  [
                                    {
                                      prim: 'PUSH',
                                      args: [
                                        { prim: 'string' },
                                        { string: `Contract does not exist` },
                                      ],
                                    },
                                    { prim: 'FAILWITH' },
                                  ],
                                  [{ prim: 'DIP', args: [[{ prim: 'DROP' }]] }],
                                ],
                              },
                              {
                                prim: 'PUSH',
                                args: [{ prim: 'mutez' }, { int: '0' }],
                              },
                            ],
                          ],
                        },
                        { prim: 'TRANSFER_TOKENS' },
                        {
                          prim: 'DIP',
                          args: [[{ prim: 'NIL', args: [{ prim: 'operation' }] }]],
                        },
                        { prim: 'CONS' },
                        { prim: 'DIP', args: [[{ prim: 'UNIT' }]] },
                        { prim: 'PAIR' },
                      ],
                    ],
                  },
                ],
              ],
            },
            { prim: 'APPLY' },
            {
              prim: 'DIP',
              args: [
                [
                  {
                    prim: 'PUSH',
                    args: [{ prim: 'address' }, { string: 'KT1VAy1o1FGiXYfD3YT7x7k5eF5HSHhmc1u6' }],
                  },
                  { prim: 'DUP' },
                  {
                    prim: 'CONTRACT',
                    args: [
                      {
                        prim: 'lambda',
                        args: [
                          { prim: 'unit' },
                          {
                            prim: 'pair',
                            args: [
                              { prim: 'list', args: [{ prim: 'operation' }] },
                              { prim: 'unit' },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    prim: 'IF_NONE',
                    args: [
                      [
                        {
                          prim: 'PUSH',
                          args: [{ prim: 'string' }, { string: `Contract does not exists` }],
                        },
                        { prim: 'FAILWITH' },
                      ],
                      [{ prim: 'DIP', args: [[{ prim: 'DROP' }]] }],
                    ],
                  },
                  { prim: 'PUSH', args: [{ prim: 'mutez' }, { int: '0' }] },
                ],
              ],
            },
            { prim: 'TRANSFER_TOKENS' },
            {
              prim: 'DIP',
              args: [[{ prim: 'NIL', args: [{ prim: 'operation' }] }]],
            },
            { prim: 'CONS' },
          ],
        ],
      },
      { prim: 'CONS' },
      { prim: 'DIP', args: [[{ prim: 'UNIT' }]] },
      { prim: 'PAIR' },
    ]);


  });

  it(`Should fail to create a LambdaView instance if entrypoints[this.viewMethod].prim !== 'pair'`, async () => {
    mockRpcClientView.getEntrypoints.mockResolvedValue({
      entrypoints: {
        getAllowance: {
          prim: 'nat',
          args: [
            { prim: 'pair', args: [{ prim: 'address' }, { prim: 'address' }] },
            { prim: 'contract', args: [{ prim: 'nat' }] },
          ],
        },
      },
    });
    const viewContract = await toolkitView.contract.at('KT1A87ZZL8mBKcWGr34BVsERPCJjfX82iBto');
    const lambdaContract = await toolkitLambda.contract.at('KT1VAy1o1FGiXYfD3YT7x7k5eF5HSHhmc1u6');

    expect(
      () =>
        new LambdaView(lambdaContract, viewContract, 'getAllowance', {
          prim: 'Pair',
          args: [
            { string: 'tz1c1X8vD4pKV9TgV1cyosR7qdnkc8FTEyM1' },
            { string: 'tz1Nu949TjA4zzJ1iobz76fHPZbWUraRVrCE' },
          ],
        })
    ).toThrow(`Expected {'prim': 'pair', ..} but found {'prim': nat, ..}`);


  });

  it(`Should fail to create a LambdaView instance if length of args entrypoint !== 2`, async () => {
    mockRpcClientView.getEntrypoints.mockResolvedValue({
      entrypoints: {
        getAllowance: {
          prim: 'pair',
          args: [
            { prim: 'pair', args: [{ prim: 'address' }, { prim: 'address' }] },
            { prim: 'contract', args: [{ prim: 'nat' }] },
            { prim: 'contract', args: [{ prim: 'nat' }] },
          ],
        },
      },
    });
    const viewContract = await toolkitView.contract.at('KT1A87ZZL8mBKcWGr34BVsERPCJjfX82iBto');
    const lambdaContract = await toolkitLambda.contract.at('KT1VAy1o1FGiXYfD3YT7x7k5eF5HSHhmc1u6');

    expect(
      () =>
        new LambdaView(lambdaContract, viewContract, 'getAllowance', {
          prim: 'Pair',
          args: [
            { string: 'tz1c1X8vD4pKV9TgV1cyosR7qdnkc8FTEyM1' },
            { string: 'tz1Nu949TjA4zzJ1iobz76fHPZbWUraRVrCE' },
          ],
        })
    ).toThrowError(/Expected an Array of length 2, but found:/);


  });

  it(`Should fail to create a LambdaView instance if callbackContract.prim !== 'contract'`, async () => {
    mockRpcClientView.getEntrypoints.mockResolvedValue({
      entrypoints: {
        getAllowance: {
          prim: 'pair',
          args: [
            { prim: 'pair', args: [{ prim: 'address' }, { prim: 'address' }] },
            { prim: 'pair', args: [{ prim: 'address' }, { prim: 'address' }] },
          ],
        },
      },
    });
    const viewContract = await toolkitView.contract.at('KT1A87ZZL8mBKcWGr34BVsERPCJjfX82iBto');
    const lambdaContract = await toolkitLambda.contract.at('KT1VAy1o1FGiXYfD3YT7x7k5eF5HSHhmc1u6');

    expect(
      () =>
        new LambdaView(lambdaContract, viewContract, 'getAllowance', {
          prim: 'Pair',
          args: [
            { string: 'tz1c1X8vD4pKV9TgV1cyosR7qdnkc8FTEyM1' },
            { string: 'tz1Nu949TjA4zzJ1iobz76fHPZbWUraRVrCE' },
          ],
        })
    ).toThrowError(/Expected a {prim: 'contract', ...}, but found:/);


  });

  it(`Should fail to create a LambdaView instance if callbackContract.args.length !== 1`, async () => {
    mockRpcClientView.getEntrypoints.mockResolvedValue({
      entrypoints: {
        getAllowance: {
          prim: 'pair',
          args: [
            { prim: 'pair', args: [{ prim: 'address' }, { prim: 'address' }] },
            { prim: 'contract', args: [{ prim: 'nat' }, { prim: 'nat' }] },
          ],
        },
      },
    });
    const viewContract = await toolkitView.contract.at('KT1A87ZZL8mBKcWGr34BVsERPCJjfX82iBto');
    const lambdaContract = await toolkitLambda.contract.at('KT1VAy1o1FGiXYfD3YT7x7k5eF5HSHhmc1u6');

    expect(
      () =>
        new LambdaView(lambdaContract, viewContract, 'getAllowance', {
          prim: 'Pair',
          args: [
            { string: 'tz1c1X8vD4pKV9TgV1cyosR7qdnkc8FTEyM1' },
            { string: 'tz1Nu949TjA4zzJ1iobz76fHPZbWUraRVrCE' },
          ],
        })
    ).toThrowError(/Expected a single argument to 'contract', but found:/);


  });

  it(`Should fail to create a LambdaView instance if the view entrypoint does not exist`, async () => {
    mockRpcClientView.getEntrypoints.mockResolvedValue({
      entrypoints: {
        getAllowance: {
          prim: 'pair',
          args: [
            { prim: 'pair', args: [{ prim: 'address' }, { prim: 'address' }] },
            { prim: 'contract', args: [{ prim: 'nat' }, { prim: 'nat' }] },
          ],
        },
      },
    });
    const viewContract = await toolkitView.contract.at('KT1A87ZZL8mBKcWGr34BVsERPCJjfX82iBto');
    const lambdaContract = await toolkitLambda.contract.at('KT1VAy1o1FGiXYfD3YT7x7k5eF5HSHhmc1u6');

    expect(() => new LambdaView(lambdaContract, viewContract, 'test')).toThrowError(
      'Contract at KT1A87ZZL8mBKcWGr34BVsERPCJjfX82iBto does not have entrypoint: test'
    );


  });

  it(`Should fail to create a LambdaView instance if the callback has no args`, async () => {
    mockRpcClientView.getEntrypoints.mockResolvedValue({
      entrypoints: {
        getAllowance: {
          prim: 'pair',
          args: [
            {
              prim: 'pair',
              args: [{ prim: 'address' }, { prim: 'address' }],
            },
            { prim: 'contract' },
          ],
        },
      },
    });

    const viewContract = await toolkitView.contract.at('KT1A87ZZL8mBKcWGr34BVsERPCJjfX82iBto');
    const lambdaContract = await toolkitLambda.contract.at('KT1VAy1o1FGiXYfD3YT7x7k5eF5HSHhmc1u6');

    expect(() => new LambdaView(lambdaContract, viewContract, 'getAllowance')).toThrowError(
      'Callback contract args undefined'
    );


  });
});
