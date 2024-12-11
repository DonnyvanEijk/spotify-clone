
import { getURL } from "@/lib/helper";
import { stripe } from "@/lib/stripe";
import { createOrRetrieveCustomer } from "@/lib/supabaseAdmin";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const supabase  =  createRouteHandlerClient({
            cookies
        })

        const {data: {user}} = await supabase.auth.getUser()

        if (!user) throw new Error("User not found")

        const customer  =await createOrRetrieveCustomer({
            uuid: user?.id || '',
            email: user?.email || ''
        })
        
        if (!customer) throw new Error("Customer not found")

        const {url}  = await stripe.billingPortal.sessions.create({
            customer,
            return_url: `${getURL()}/account`
        })
        return NextResponse.json({url})
    }

    catch {
        return new NextResponse('Internal Server Error', {status: 500})
    }
}