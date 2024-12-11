import { getURL } from "@/lib/helper";
import { stripe } from "@/lib/stripe";
import { createOrRetrieveCustomer } from "@/lib/supabaseAdmin";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
    request:Request
) {
    const {price, quantity = 1, metadata = {}} = await request.json()
    try {
        const supabase = createRouteHandlerClient({
            cookies,
        });

        const{ data: {user} } = await supabase.auth.getUser()

        const customer = await createOrRetrieveCustomer({
            uuid: user?.id || '',
            email: user?.email || ''
        })

        const session = await stripe.checkout.sessions.create({
            billing_address_collection: 'required',
            customer,
            line_items: [
                {
                    price: price.id,
                    quantity
                }
            ],              
            mode: 'subscription',
            allow_promotion_codes: true,
            payment_method_types: ['card'],
            subscription_data: {
                trial_period_days: 7,
               
                metadata
            },
            success_url: `${getURL()}/account`,
            cancel_url: `${getURL()}`

        })
        
        return NextResponse.json({sessionId: session.id})
    }
    catch (error) {
        console.log(error)
        return new NextResponse('Internal Server Error', {status: 500})
    }
}
