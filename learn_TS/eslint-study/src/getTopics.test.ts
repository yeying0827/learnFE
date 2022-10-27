import {getTopics} from "./getTopics";

test('should', async () => {
    const { data } = await getTopics();

    expect(data).not.toBeUndefined();
    expect(data.success).toBeTruthy();
})
