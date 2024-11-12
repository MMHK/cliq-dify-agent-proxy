import {ChatClient} from "dify-client";
import {v4} from "uuid";


const UUID = () => {
    return `${v4()}`;
}

class SseParser {
    constructor() {
        this.buffer = '';
    }

    read(chunk) {
        this.buffer += chunk;
    }

    parse() {
        const lines = this.buffer.split('\n');

        const events = lines.filter(row => {
            return row.startsWith('data: ');
        }).map((row) => {
            const json = row.replace('data: ', '');
            if (json.length > 0) {
                return JSON.parse(json);
            }
            return {};
        }).filter((row) => {
            if (['agent_message', 'agent_thought', 'error'].includes(row.event)) {
                if (row.event == "agent_thought") {
                    return row.thought && row.tool && row.observation;
                }
                return true;
            }
            return false;
        });

        if (events.find(e => e.event === 'error')) {
            const errorMessage = events.filter(e => e.event === 'error')
                .map(e => e.message)
                .join('');

            throw new Error(errorMessage);
        }

        return events.map((row) => {
            if (row.thought) {
                return `\n[使用 ${row.tool} ...]\n`;
            }
            return row.answer || '';
        }).join('');
    }
}

const createChatMessage = async (inputs = {}, query= '', user = '', conversation_id = '') => {
    const difyClient = new ChatClient(process.env.DIFY_API_KEY, process.env.DIFY_API_URL);

    if (!user) {
        user = UUID();
    }

    const response = await difyClient.createChatMessage(inputs, query, user, true, conversation_id);
    const stream = response.data;

    return new Promise((resolve, reject) => {
        let parser = new SseParser();
        stream.on('data', (chunk) => {
            parser.read(chunk);
        });
        stream.on('end', () => {
            try {
                const json = parser.parse();
                resolve(json);
            } catch (e) {
                reject(e);
            }
        });
        stream.on('error', (err) => {
            console.error(err);
            reject(err);
        });
    });
}

export {
    createChatMessage,
    UUID,
}
