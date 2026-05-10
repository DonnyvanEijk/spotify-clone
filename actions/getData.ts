import { createClient } from "@/lib/supabase/server";

const getData = async (table: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase.from(table).select('*');

  console.log("Response from Supabase:", { data, error });

  if (error) {
    console.error("Error fetching data:", error);
    return { error, data };
  }

  return data;
};

export default getData;
