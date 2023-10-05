import {ReactNode} from "react";
import {Route, Routes as BrowserRoutes} from "react-router-dom";
import PostPage from "@/pages/Posts/PostPage.tsx";
import EditProfile from "@/pages/Profile/EditProfile.tsx";
import Layout from "./Layout.tsx";
import {NotFoundPage} from "@/pages/Share/NotFoundPage.tsx";
import ProfileInfo from "@/pages/Profile/ProfileInfo.tsx";
import Users from "@/pages/Users/Users.tsx";
import Stats from "@/pages/Stats/Stats.tsx";

const routes: { element: ReactNode, path: string }[] = [
    {element: <PostPage/>, path: '/'},
    {element: <PostPage/>, path: '/posts'},
    {element: <Users/>, path: '/users'},
    {element: <EditProfile/>, path: '/profile/edit'},
    {element: <ProfileInfo/>, path: '/profile/:id'},
    {element: <Stats/>, path: '/stats'},
    {element: <NotFoundPage/>, path: '/*'},
]

const Routes = () => {
    return (
        <BrowserRoutes>
            <Route path="/" element={<Layout/>}>
                {routes?.map(r =>
                    <Route key={r.path} path={r.path} element={r.element}/>
                )}
            </Route>
        </BrowserRoutes>
    );
}

export default Routes;