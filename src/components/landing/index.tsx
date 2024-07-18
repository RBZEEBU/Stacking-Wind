"use client";

import { useEffect, useState, Fragment } from "react";
import { useAccount } from "wagmi";
// import { useLingui } from "@lingui/react";
// import Register from "@/components/register";
import Loader from "@/components/Loader";
import { getUserDetail } from "@/helper/commonUtils";
import { useRouter } from "next/navigation";
import { Row, Col } from 'reactstrap';
import RegistrationForm from "@/components/landing/RegistrationForm";
import UserCount from "./UserCount";
// import Calculator from "./Calculator";
import FAQ from "./FAQ";
import { Trans } from "@lingui/macro";

const Landing = (props: any) => {

    // const { i18n } = useLingui();
    const router = useRouter();
    const [loading, setLoading] = useState<Boolean>(true);
    const { address, isConnected } = useAccount();

    useEffect(() => {
        // console.log("address", address, isConnected)
        setLoading(true);
        if (address && isConnected) {
            checkUserExists(address);
        } else {
            setLoading(false);
        }
    }, [address])

    const checkUserExists = async (userAddress: string) => {
        const userDetail: any = await getUserDetail(userAddress, true);
        if (![undefined, null, ""].includes(userDetail.email)) {
            router.push("/dashboard");
        } else {
            setLoading(false);
        }
    }

    return (
        <>
            {loading && <Loader />}
            <Row>
                <Col md={12}>
                    <div className='zeebuadd'>
                        <h2><span id="totalInvoiceValue"><Trans>2 Billion</Trans></span> <Trans>Reasons to Celebrate Our Settlement Success!</Trans></h2>
                    </div>
                </Col>
            </Row>
            <Fragment>
                <div className='signupprocess'>
                    <Row>
                        <Col md={4} lg={4} xl={6}>
                            <div className='cardleftpanel'>
                                <div className='cardleftdetails'>
                                    <h1><Trans>Get exclusive access to Zeebu Protocol & </Trans></h1><span><Trans>Earn Rewards!</Trans></span>
                                    <p><Trans>Experience the symphony of Staking, Liquidity, decentralized settlements & Rewards.</Trans></p>
                                </div>
                            </div>
                        </Col>
                        <Col md={8} lg={8} xl={6}>
                            <RegistrationForm />
                            {/* {isSuspended && <BlockUser />} */}
                        </Col>
                        <UserCount />
                        {/* <Calculator /> */}
                        <FAQ />
                    </Row>
                </div>
            </Fragment>
        </>
    );
};
export default Landing;