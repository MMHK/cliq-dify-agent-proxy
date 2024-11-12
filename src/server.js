import fastify from 'fastify';
import {installSwagger, installSwaggerUi} from "./swagger.js";
import {installRoutes} from "./router.js";
import fastifyStatic from "@fastify/static";

const app = fastify({
    bodyLimit: 1048576 * 10, // 10MB
    logger: {
        transport: {
            target: '@fastify/one-line-logger'
        }
    }
});

const StartService = async (port = null) => {
    if (!port) {
        port = process.env.PORT || 3000;
    }

    await installSwagger(app);
    await installSwaggerUi(app);
    installRoutes(app);
    await app.ready()
    app.listen({
        host: '0.0.0.0',
        port,
    }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });

}

export default StartService;
export { StartService };
