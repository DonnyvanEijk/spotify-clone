import { Header } from "@/components/header";
import { BillingContent } from "./components/billing-content";
import { InfoContent } from "./components/info-content";

const AccountPage = () => {
    return ( 
        <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
            <Header className="from-bg-neutral-900">
                <div className="mb-2 flex flex-col gap-y-6">
                    <h1 className="text-white text-3xl font-semibold">
                        Account Settings
                    </h1>
                </div>
            </Header>
            <BillingContent/>
            <InfoContent/>
        </div>
     );
}
 
export default AccountPage;