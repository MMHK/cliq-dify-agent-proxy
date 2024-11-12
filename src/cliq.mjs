import axios from "axios";

const ClIQ_BOT_INCOMING_URL = process.env.ClIQ_BOT_INCOMING_URL || 'http://localhost:3000';
const CLIQ_WEBHOOK_TOKEN = process.env.CLIQ_WEBHOOK_TOKEN || '123456789';

const CliqBotCallback = async (params = {
    user: '',
    chat_id: '',
    text: '',
    mention: '',
}) => {
    const response = await axios.post(`${ClIQ_BOT_INCOMING_URL}?zapikey=${CLIQ_WEBHOOK_TOKEN}`, params, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

export {
    CliqBotCallback
}
