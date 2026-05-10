"use server";

import { Radio } from "@/types";
import { createClient } from "@/lib/supabase/server";

const getRadios = async (): Promise<Radio[]> => {
  const supabase = await createClient();

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

  return data.map((radio: any) => ({
    ...radio,
    image_path: radio.image_path || "",
    radio_path: radio.radio_path || "",
    genres: radio.genres || "",
  }));
};

export default getRadios;
