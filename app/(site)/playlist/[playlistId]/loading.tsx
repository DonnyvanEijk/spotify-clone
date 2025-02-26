"use client"
import { Box } from "@/components/box";
import { BounceLoader } from "react-spinners";

const Loading = () => {
    return ( 
        <Box className="h-full flex items-center justify-center">
            <BounceLoader color="#8F00FF" size={40}/>
        </Box>
     );
}
 
export default Loading;