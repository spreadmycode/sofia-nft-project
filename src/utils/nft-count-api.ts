import axios from "axios";

export async function addTransactionLog(pubkey: string, hold_cnt: number, txid: string) {
    try {
        await axios.post('http://146.71.79.134/add_tx', { data:{ pubkey, hold_cnt, txid } });
        return true;
    } catch (error) {
        return false;
    }
}
