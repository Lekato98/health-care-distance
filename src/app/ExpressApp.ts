import express, { Express } from 'express';
import HomeRoute from './routes/HomeRoute';
import path from 'path';
import cors from 'cors';
import bodyParser, { OptionsUrlencoded } from 'body-parser';
import MongooseService from './services/MongooseService';
import ApiRoute from './routes/apis/v1/ApiRoute';
import AuthRoute from './routes/AuthRoute';
import AuthMiddleware from './middlewares/AuthMiddleware';
import { Inject } from 'dependency-injection-v1';
import UserRoute from './routes/UserRoute';

const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

class ExpressApp {
    public app: Express = express();
    public readonly PORT: string = process.env.PORT;
    public readonly PUBLIC_FILE_PATH: string = path.join(__dirname, 'public'); // public folder
    public readonly VIEWS_PATH: string = path.join(__dirname, 'public/views'); // views folder
    public readonly urlencodedOptions: OptionsUrlencoded = {extended: true};
    public readonly requestLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    });
    public readonly MIDDLEWARES = [
        bodyParser.json(),
        bodyParser.urlencoded(this.urlencodedOptions),
        cors(),
        cookieParser(),
        express.json(),
        express.static(this.PUBLIC_FILE_PATH),
        compression(),
    ];
    @Inject(AuthMiddleware) private authMiddleware: AuthMiddleware;

    constructor() {
        this.app.listen(this.PORT, () => console.log(`Server listening to ${ this.PORT }`));

        this.initializeViewEngine();
        this.initializeMiddlewares();
        this.initializeRoutes();
        // this.app.set('trust proxy', 1);

        // connect to mongoDB
        MongooseService.connect()
            .then(() => console.log('~Mongoose Connected'));
    }

    public initializeViewEngine(): void {
        this.app.set('view engine', 'ejs');
        this.app.set('views', this.VIEWS_PATH);
    }

    public initializeMiddlewares(): void {
        this.app.use(this.requestLimiter); // @TOP PRIORITY to avoid DDOS attack and spammer
        this.app.use(this.MIDDLEWARES); // called before any request
        this.app.use(this.authMiddleware.setAuth); // should be called before any request
    }

    public initializeRoutes(): void {
        this.app.use(ApiRoute.ROUTE_PREFIX_URL, ApiRoute.ROUTE); // /api/v1 @api version 1
        this.app.use(AuthRoute.ROUTE_PREFIX_URL, AuthRoute.ROUTE); // /auth @auth
        this.app.use(UserRoute.ROUTE_PREFIX_URL, UserRoute.ROUTE);
        this.app.use(HomeRoute.ROUTE_PREFIX_URL, HomeRoute.ROUTE); // / @default
    }
}

export default ExpressApp;
