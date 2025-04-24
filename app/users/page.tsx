

import { getUsersIndex } from "@/actions/getUsers";
import { Header } from "@/components/header";
import { UsersContent } from "@/components/users/UsersContent";

const UsersPage = async () => {
    const users = await getUsersIndex();
    return ( 
    <div className="text-white">
        <Header>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-gray-400">Every user on the platform!</p>
        </Header>
        <UsersContent users={users}/>
    </div>
     );
}
 
export default UsersPage;