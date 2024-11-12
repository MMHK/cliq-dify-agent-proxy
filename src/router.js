import zlib from "zlib";
import {createChatMessage, UUID} from "./dify.mjs";
import {CliqBotCallback} from "./cliq.mjs"


/**
 *
 * @param {import('fastify').FastifyRequest}  request
 * @param {import('fastify').FastifyReply} reply
 * @returns {Promise<void>}
 * @constructor
 */
const AuthToken = async (request, reply) => {
  if (!process.env.AUTH_TOKEN) {
    return;
  }
  const {headers} = request;
  const AuthHeader = headers['authorization'];
  if (AuthHeader && AuthHeader === process.env.AUTH_TOKEN) {
      return;
  }
  return reply.send({
    text: "Unauthorized",
  }, 406)
}


/**
 *  @param {import('fastify').FastifyInstance} app
 */
const installRoutes = (app) => {

    app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
        if (req.headers['content-encoding'] && req.headers['content-encoding'] === 'gzip') {
            zlib.gunzip(body, function (err, dezipped) {
                if (err) {
                    done(err, null)
                } else {
                    done(err, JSON.parse(dezipped.toString('utf-8')))
                }
            })
        } else {
            done(null, JSON.parse(body.toString('utf-8')))
        }
    })

    app.get("/", {
      schema: {
        hide: true,
      },
    }, async (request, reply) => {
      return reply.redirect('/swagger');
    })

    app.post('/api/ask', {
        preHandler: AuthToken,
        schema: {
            security: process.env.AUTH_TOKEN ? [{ bearerAuth: [] }] : undefined,
            tags: ['Dify'],
            summary: '詢問 Dify Agent 問題',
            body: {
                type: 'object',
                required: ['query'],
                properties: {
                    inputs: {
                        type: 'object',
                        description: '預留 Agent 全局參數',
                        properties: {
                          user: {
                            type: 'string',
                            description: '用戶標識 一般是 Email',
                          },
                          chat_id: {
                            type: 'string',
                            description: '對話 ID',
                          },
                          mention: {
                            type: 'string',
                            description: '@誰',
                          }
                        }
                    },
                    query: {
                        type: 'string',
                        description: '用戶的問題',
                    },
                    conversation_id : {
                        type: 'string',
                        description: '對話 ID'
                    },
                }
            },
            response: {
              default: {
                type: 'object',
                properties: {
                  text: {
                    type: 'string',
                    description: 'Agent 回覆的內容',
                  },
                  user: {
                    type: 'string',
                    description: '用戶標識 一般是 Email',
                  },
                  chat_id: {
                    type: 'string',
                    description: '對話 ID',
                  },
                  mention: {
                    type: 'string',
                    description: '@誰',
                  },
                }
              }
            }
        },
    }, async (request, reply) => {
        let { inputs, query, conversation_id } = request.body;

        let user = UUID();
        let mention = '';
        let chat_id = UUID();
        if (inputs.user) {
          user = inputs.user;
        }
        if (inputs.mention) {
          mention = inputs.mention;
        }
        if (inputs.chat_id) {
          chat_id = inputs.chat_id;
        }
        conversation_id = conversation_id || '';

        try {
            const text = await createChatMessage({
              user,
              mention,
              chat_id,
            }, query, user, conversation_id);

            CliqBotCallback({
              user,
              mention,
              chat_id,
              text,
            })

          return reply.status(200).send({
            text,
            user,
            mention,
            chat_id,
          });

        } catch (error) {
            return reply.status(400).send({
              text: error.message,
              user,
              mention,
              chat_id,
            });
        }

      return reply.status(400).send({
        text: '錯誤',
        user,
        mention,
        chat_id,
      });
    });
};

export {
    installRoutes,
}
