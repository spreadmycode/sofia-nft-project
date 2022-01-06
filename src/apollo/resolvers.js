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
            const filters = args.filters || [];
            const after = args.after || 0;
            const ids = args.ids || [];
            const bottom = args.bottom || 0;
            const top = args.top || 0;
            const sort = args.sort || 'pos-ASC';

            const data = await getItems(first, filters, after, ids, bottom, top, sort);
            const items = data.items;
            const offset = data.offset;
            const totalCount = data.totalCount;
            const traits = data.traits;

            if (totalCount == 0) {
                return {
                    pageInfo: {
                        endCursor: null,
                        hasNextPage: false,
                        traits: "[]"
                    },
                    edges: [],
                };
            }

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
