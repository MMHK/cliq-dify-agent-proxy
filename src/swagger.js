import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

/**
 * @param {import('fastify').FastifyInstance} app
 * @returns {Promise<any>}
 */
const installSwagger = async (app) => {
    await app.register(fastifySwagger, {
        swagger: {
            mode: "dynamic",
            info: {
                title: 'Dify Agent Proxy for Cliq',
                description: 'Dify Agent Proxy for Cliq',
                version: '1.0.0'
            },
            consumes: ['application/json'],
            produces: ['application/json'],
            securityDefinitions: {
                bearerAuth: {
                    type: 'apiKey',
                    schema: 'bearer',
                    name: 'Authorization',
                    in: 'header',
                }
            },
        }
    });

    await app.addHook("onRequest", (request, reply, done) => {
        let host = request.headers['x-forwarded-host'] || request.headers.host;
        const protocol = request.headers['x-forwarded-proto'] || request.protocol;

        if (`${host}`.includes(",")) {
            host = host.split(",")[0];
        }

        app.swagger().host = `${host}`;

        done();
    });
}

/**
 * @param {import('fastify').FastifyInstance} app
 * @returns {Promise<any>}
 */
const installSwaggerUi = (app) => {
    return app.register(fastifySwaggerUi, {
        routePrefix: '/swagger',
        uiConfig: {
            docExpansion: 'full',
            deepLinking: false
        },
        uiHooks: {
            onRequest: function (request, reply, next) { next(); },
            preHandler: function (request, reply, next) { next(); }
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
        transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
        exposeRoute: true
    });
}

export {
    installSwagger,
    installSwaggerUi
}
