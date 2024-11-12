import dotenv from 'dotenv';
dotenv.config();

import(/* webpackMode: "eager" */"./src/server.js")
    .then(({ StartService }) => {
        StartService();
    });

