import axios from "axios";

export async function getItems(first, after) {
    const response = await axios.post('http://146.71.79.134/get_items', { data: {first, after}});
    return response.data;
}
