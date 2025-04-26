import {UserModel} from "./util/users.js";

export async function onRequest (context, next) {
    // check the session for the user
    const session = context.session;
    const user = session && await session.get("user");
    if (user) {
        console.log(user);
        // check if session has the latest data
        // if not, logout the user
        if (!await UserModel.isLatest(user)) {
            session.destroy();

            return context.redirect("/");
        }
    }
    // return a Response or the result of calling `next()`
    return next();
}