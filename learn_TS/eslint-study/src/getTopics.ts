import axios from 'axios';

const url = 'https://cnodejs.org/api/v1/topics';

export async function getTopics() {
    const res = await axios.get(url);
    return res;
}
