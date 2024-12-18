import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getData = async (table: string) => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    const { data, error } = await supabase
        .from(table)
        .select('*');

    console.log("Response from Supabase:", { data, error });

    if (error) {
        console.error("Error fetching data:", error);
        return { error, data };
    }

    return data;
}

export default getData;