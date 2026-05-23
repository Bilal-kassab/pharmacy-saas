import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ActiveUserData } from "../interfaces/actice-user-data.interface";
import { REQUEST_USER_KEY } from "../iam.constant";


export const ActiveUser= createParamDecorator(
    (field:keyof ActiveUserData|undefined ,  ctx:ExecutionContext)=>{
        const user=ctx.switchToHttp().getRequest();

        // const userData= user[REQUEST_USER_KEY];
        const activeUser :ActiveUserData = user[REQUEST_USER_KEY];

        return field ? activeUser?.[field] : activeUser;
    }
);