import { 
    insertAffiliation,
    getPubkey,
    getCode,
    addTransactionLog
} from '../libs/affiliation';
import { getItems } from '../libs/rarity';

export const resolvers = {
    Query: {
        async getItems(_parent, args, context, _info) {
            const first = args.first || 5;
            const after = args.after || 0;

            const data = await getItems(first, after);
            const items = data.items;
            const offset = data.offset;
            const totalCount = data.totalCount;
            const traits = data.traits;

            const lastItem = items[items.length - 1];
            return {
                pageInfo: {
                    endCursor: lastItem.hash,
                    hasNextPage: offset + first < totalCount,
                    traits
                },
                edges: items.map((item) => ({
                    cursor: item.hash,
                    node: item,
                })),
            };
        }
    },
    Mutation: {
        async insertAffiliation(_parent, args, _context, _info) {
            const data = await insertAffiliation(args.input.pubkey, args.input.code);
            return { data };
        },
        async getPubkey(_parent, args, _context, _info) {
            const pubkey = await getPubkey(args.input.code);
            return { pubkey };
        },
        async getCode(_parent, args, _context, _info) {
            const code = await getCode(args.input.pubkey);
            return { code };
        },
        async addTransactionLog(_parent, args, _context, _info) {
            const data = await addTransactionLog(args.input.pubkey, args.input.holdcnt, args.input.txid);
            return { data };
        }
    },
};
