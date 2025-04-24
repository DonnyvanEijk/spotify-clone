"use client";

type Props = {
    params: {
        id: string;
    }
}

const UserPage = ({params}:Props) => {
    return ( 
        <div>
            THIS IS THE SELECTED USER: {params.id} 
        </div>
     );
}
 
export default UserPage;