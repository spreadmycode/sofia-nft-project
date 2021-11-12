import excuteQuery from './db';

export async function insertAffiliation(pubkey, code) {
    try {
        const result = await excuteQuery({
            query: 'INSERT INTO affiliation (pubkey, code) VALUES(?, ?)',
            values: [pubkey, code],
        });
        console.log(result);
    } catch (error) {
        console.log(error);
    }
    return {pubkey, code};
}

export async function getPubkey(code) {
    try {
        const result = await excuteQuery({
            query: 'SELECT pubkey FROM affiliation WHERE code = ?',
            values: [code],
        });
        console.log(result);
        return result[0]['pubkey'];
    } catch (error) {
        console.log(error);
    }
    return '';
}

export async function getCode(pubkey) {
    try {
        const result = await excuteQuery({
            query: 'SELECT code FROM affiliation WHERE pubkey = ?',
            values: [pubkey],
        });
        console.log(result);
        return result[0]['code'];
    } catch (error) {
        console.log(error);
    }
    return '';
}
