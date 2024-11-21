import zlib from "zlib";
import {createChatMessage, UUID} from "./dify.mjs";
import {CliqBotCallback} from "./cliq.mjs"
import qs from "qs";



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
  console.error("Unauthorized");
  return reply.send({
    text: "Unauthorized",
  }, 406)
}

const parseCliqFormBody = (body) => {
  let postBody = qs.parse(body);
  if (typeof postBody.inputs == 'string') {
    try {
      postBody.inputs = JSON.parse(postBody.inputs)
    } catch (e) {
      console.error(e);
    }
  }

  return postBody;
}


/**
 *  @param {import('fastify').FastifyInstance} app
 */
const installRoutes = (app) => {

  app.addContentTypeParser('application/x-www-form-urlencoded', { parseAs: 'buffer' }, (req, body, done) => {
    // console.log(`x-www-form-urlencoded headers`);
    // console.log(req.headers);

    if (req.headers['content-encoding'] && req.headers['content-encoding'] === 'gzip') {
        zlib.gunzip(body, function (err, dezipped) {
          if (err) {
            done(err, null)
          } else {
            done(err, parseCliqFormBody(dezipped.toString('utf-8')))
          }
        })
      } else {
        // console.log(`x-www-form-urlencoded post body:`);
        const postBody = parseCliqFormBody(body.toString('utf-8'));
        // console.log(postBody);
        done(null, {...postBody})
      }
    });

    app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
        if (req.headers['content-encoding'] && req.headers['content-encoding'] === 'gzip') {
            zlib.gunzip(body, function (err, dezipped) {
                if (err) {
                    done(err, null)
                } else {
                    try {
                      done(err, JSON.parse(dezipped.toString('utf-8')));
                    } catch (e) {
                      done(e, dezipped.toString('utf-8'))
                    }
                }
            })
        } else {
          try {
            done(null, JSON.parse(body.toString('utf-8')));
          } catch (e) {
            done(e, body.toString('utf-8'))
          }
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
            consumes: ['application/json', 'application/x-www-form-urlencoded'],
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
    }, (request, reply) => {

      let { inputs, query, conversation_id } = request.body;

      // console.log("handle post");
      // console.log(request.body);

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

      createChatMessage({
        user,
        mention,
        chat_id,
      }, query, user, conversation_id)
        .then((text) => {
          CliqBotCallback({
            user,
            mention,
            chat_id,
            text,
          });
        }).catch(error => {
          console.log(error);
        return reply.status(400).send({
          text: error.message,
          user,
          mention,
          chat_id,
        });
      });



      return reply.status(200).send({
        text: '请稍后',
        user,
        mention,
        chat_id,
      });
    });
};

export {
    installRoutes,
}
