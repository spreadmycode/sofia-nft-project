import { 
    insertAffiliation,
    getPubkey,
    getCode
} from '../libs/affiliation';

export const resolvers = {
    Query: {
        async viewer(_parent, args, context, _info) {
            const pubkey = await getPubkey(args.input.code);
            return { pubkey };
        },
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
    },
};
