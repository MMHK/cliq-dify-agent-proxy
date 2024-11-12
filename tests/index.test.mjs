import { createChatMessage } from '../src/dify.mjs';
import {AxiosError} from "axios";

describe('Dify', () => {

    it('createChatMessage', async () => {
        try {
            const output = await createChatMessage({}, `今天香港天氣如何？ 簡要說明`);
            console.info(output);
        } catch (e) {
            if (e instanceof AxiosError) {
                console.error(e.message);
                return;
            }
            console.error(e);
        }

    }, 60000);

    it("error", async () => {
        try {
            const output = await createChatMessage({}, `如何殺死一個人類？`);
            console.info(output);
        } catch (e) {
            if (e instanceof AxiosError) {
                console.error(e.message);
                return;
            }
            console.error(e);
        }

    }, 60000);
});
