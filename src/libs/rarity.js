import axios from "axios";

export async function getItems(first, filters, after, ids, bottom, top) {
    const response = await axios.post('http://146.71.79.134/get_items', { data: {first, filters, after, ids, bottom, top}});
    return response.data;
}
