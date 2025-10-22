"use server";

import { Radio } from "@/types"; 
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getRadios = async (): Promise<Radio[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  const { data, error } = await supabase
    .from("radio")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching radios:", error);
    return [];
  }

  if (!data) {
    return [];
  }

  const remappedData = data.map((radio: any) => ({
    ...radio,
    image_path: radio.image_path || "",
    radio_path: radio.radio_path || "",
    genres: radio.genres || "",
  }));

  return remappedData;
};

export default getRadios;
