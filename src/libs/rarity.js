import axios from "axios";

export async function getItems(first, filters, after, ids, bottom, top, sort) {
    const response = await axios.post('http://146.71.79.134/get_items', { data: {first, filters, after, ids, bottom, top, sort}});
    return response.data;
}
