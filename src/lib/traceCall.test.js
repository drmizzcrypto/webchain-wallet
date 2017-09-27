import BigNumber from 'bignumber.js';
import { ParityTracer } from './traceCall';

describe('ParityTracer', () => {
    it('should creates call', () => {
        const tx = {
            from: '0x1',
            to: '0x2',
        };
        const tracer = new ParityTracer(tx);
        const call = tracer.buildRequest();
        console.log(call);
        expect(call.method).toBe('trace_call');
        expect(call.params[0].from).toBe(tx.from);
    });

    describe('Gas estimator', () => {
        const from = '0xTESTADDRESSFROM';
        const to = '0xTESTADDRESSTO';
        let value = '0x038d7ea4c68000';
        let gasPrice = '0x04e3b29200';

        it('estimate call', () => {
            const trace = { output: '0x',
                stateDiff: {
                    '0xtestaddressto': {
                        balance: { '*': { from: '0x21526d0318ec01', to: '0x24dfeba7df6c01' } },
                        code: '=',
                        nonce: '=',
                        storage: {} },
                    '0xtestaddressfrom': { balance: { '*': { from: '0x98155a85ae35a03e0', to: '0x9815089c5ee3af3e0' } },
                        code: '=',
                        nonce: { '*': { from: '0x1f', to: '0x20' } },
                        storage: {} },
                    '0xef24b72ed3164673f4837dd61692657d48d818b8': {
                        balance: { '*': { from: '0x34696a249798214e0c', to: '0x34696bb5ade879de0c' } },
                        code: '=',
                        nonce: '=',
                        storage: {} } },
                trace: [{ action: { callType: 'call', from, gas: '0x0', input: '0x', to, value },
                    result: { gasUsed: '0x0', output: '0x' },
                    subtraces: 0,
                    traceAddress: [],
                    type: 'call' }],
                vmTrace: null };
            const testData = {
                from,
                gasPrice,
                gas: '0x5208',
                to,
                value,
                data: '0x',
            };
            expect(ParityTracer.estimateGasFromTrace(testData, trace)).toEqual(new BigNumber('441000000000000'));
            expect(ParityTracer.estimateGasFromTrace(testData, trace).div(gasPrice).toString(10)).toEqual('21000');
        });
        it('estimate call with lower gas', () => {
            gasPrice = '0xc845880';
            const trace = { stateDiff: {
                '0xtestaddressfrom': { balance: { '*': { from: '0x98155a85ae35a03e0', to: '0x9815216d97617bfe0' } },
                    code: '=',
                    nonce: { '*': { from: '0x1f', to: '0x20' } },
                    storage: {} },
                '0xdf7d7e053933b5cc24372f878c90e62dadad5d42': {
                    balance: { '*': { from: '0x491a8fab8806bc7698', to: '0x491a8faf8acf383a98' } },
                    code: '=',
                    nonce: '=',
                    storage: {} } },
                vmTrace: null };
            const testData = {
                from,
                gasPrice,
                gas: '0x5208',
                to,
                value,
                data: '0x',
            };
            expect(ParityTracer.estimateGasFromTrace(testData, trace))
                .toEqual(new BigNumber('441000000000000').div(100));
            expect(ParityTracer.estimateGasFromTrace(testData, trace).div(gasPrice).toString(10)).toEqual('21000');
        });
        it('handle null result', () => {
            const testData = {
                from,
                gasPrice,
                gas: '0x5208',
                to,
                value,
                data: '0x',
            };
            expect(ParityTracer.estimateGasFromTrace(testData, null)).toEqual(null);
        });
        it('estimate contract call', () => {
            value = '0x0';
            const trace = { output: '0x',
                stateDiff: { '0x0000000000000000000000000000000000000000': { balance: { '*': {
                    from: '0x26fd2a0d6c08be2d22c', to: '0x26fd29f40784dcf222c' } },
                    code: '=',
                    nonce: { '*': { from: '0x0', to: '0x1' } },
                    storage: {} },
                    '0xtestaddressto': { balance: { '+': '0x0' },
                        code: { '+': '0x' },
                        nonce: { '+': '0x0' },
                        storage: {} },
                    '0xtestaddressfrom': { balance: { '*': { from: '0x98155a85ae35a03e0', to: '0x981541212a54653e0' } },
                        code: '=',
                        nonce: { '*': { from: '0x1f', to: '0x20' } } } },
                trace: [{ action: { callType: 'call',
                    from: '0x0000000000000000000000000000000000000000',
                    gas: '0x0',
                    input: '0x12065fe0',
                    to: '0x6fc11878336e049855c93da94d89837b4a391f19',
                    value: '0x0' },
                    result: { gasUsed: '0x0', output: '0x' },
                    subtraces: 0,
                    traceAddress: [],
                    type: 'call' }],
                vmTrace: null };
            const testData = {
                from,
                gasPrice,
                gas: '0x5208',
                to,
                value,
                data: '0x12065fe0',
            };
            expect(ParityTracer.estimateGasFromTrace(testData, trace)).toEqual(new BigNumber(446712000000000));
        });

        it('estimateGas in case value not enough', () => {
            const tx = {
                from: '0x82428c371a9775ec58d28455df21ff85a7f902ff',
                to: '0x82428c371a9775ec58d28455df21ff85a7f902ff',
                gas: '0x5208',
                gasPrice: '0x04a817c800',
                value: '0x056bc75e2d63100000',
                data: '',
            };

            const trace = {
                output: '0x',
                stateDiff:
                {'0x82428c371a9775ec58d28455df21ff85a7f902ff':
                {balance:
                {'*':
                                {from: '0x18dab614449e000', to: '0x56bc75e2d63100000'}},
                    code: '=',
                    nonce: {'*': {from: '0x7', to: '0x8'}},
                    storage: {}},
                    '0xdf7d7e053933b5cc24372f878c90e62dadad5d42': {
                        balance: {'*': {from: '0x23e987a2917972b1bc2', to: '0x23e987ba71475f95bc2'}},
                        code: '=',
                        nonce: '=',
                        storage: {}}},
                trace: [
                    {action:
                    {callType: 'call',
                        from: '0x82428c371a9775ec58d28455df21ff85a7f902ff',
                        gas: '0x0',
                        input: '0x',
                        to: '0x82428c371a9775ec58d28455df21ff85a7f902ff',
                        value: '0x56bc75e2d63100000'},
                        result: {gasUsed: '0x0', output: '0x'},
                        subtraces: 0,
                        traceAddress: [],
                        type: 'call'}],
                vmTrace: null};

            const result = ParityTracer.estimateGasFromTrace(tx, trace);
            expect(result).toBe(null);
        });
    });
});
