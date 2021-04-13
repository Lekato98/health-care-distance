import IRoute from './IRoute';
import { Router } from 'express';
import UserController from '../controllers/UserController';
import { Inject } from 'dependency-injection-v1';

class UserRoute implements IRoute {
    @Inject(UserController) private userController: UserController;
    public readonly ROUTE: Router = Router();
    public readonly ROUTE_PREFIX_URL: string = '/profile';
    public readonly PROFILE_PAGE_URL: string = '/';

    constructor() {
        this.initialize();
    }

    public initialize(): void {
        this.initializeControllers();
    }

    public initializeControllers(): void {
        this.ROUTE.get(this.PROFILE_PAGE_URL, this.userController.userProfilePage);
    }
}

const profileRoute = new UserRoute();

export default profileRoute;
