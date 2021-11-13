import axios from "axios";

export async function insertAffiliation(pubkey, code) {
    const response = await axios.post('http://146.71.79.134/insert_code', { data: {pubkey, code}});
    return response.data;
}

export async function getPubkey(code) {
    const response = await axios.post('http://146.71.79.134/get_pubkey', { data: {code}});
    const result = response.data;
    if (result && result.length > 0) {
        return result[0]['pubkey'];
    }
    return '';
}

export async function getCode(pubkey) {
    const response = await axios.post('http://146.71.79.134/get_code', { data: {pubkey}});
    const result = response.data;
    if (result && result.length > 0) {
        return result[0]['code'];
    }
    return '';
}
