"use client";

import React, { useEffect, useState, useContext } from 'react';
import OtpInput from 'react-otp-input';
import { Row, Col, NavLink as Link } from 'reactstrap';
import { onCopyText, callPostAPI } from "@/helper";
import {
    getReferralCountByAddress, generateReferralCodeByAddress, getReferralCodeByAddress, getRewardDetailAndLimit, getTotalUserAndLimit, checkReferralCodeExists,
    getReferralGenerateReward, getUserDetail, initialContract, checkTransactionStatusByHash
} from "@/helper/commonUtils";
import PieChart from "./PieChart";
// import { toast } from 'react-toastify';
import { galxeRedirectLink, staticToken } from '@/consts';
import { RWebShare } from "react-web-share";
import { useSendTransaction } from 'wagmi'
import Loader from "@/components/Loader";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import ContentCopy from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import { AlertsContext } from "@/contexts/Alerts";
import { useLingui } from "@lingui/react";
import { Alert_Kind__Enum_Type } from "@/types";
import { t, Trans } from "@lingui/macro";

function UserDashboard() {

    const router = useRouter();

    const { address = '' } = useAccount();
    const { showAlert } = useContext(AlertsContext);
    const { i18n } = useLingui();

    const [genReferralCode, setGenReferralCode] = useState<string>("");
    const [referralCode, setReferralCode] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [referralCountDetail, setReferralCountDetail] = useState({ active: 0, inActive: 0 }) as any;
    const [progressBarDetail, setProgressBarDetail] = useState({ reward: 0, rewardLimit: 0, totalUser: 0, totalUserLimit: 0 }) as any;
    const [loadingMessage, setLoadingMessage] = useState<string>("");
    const [userInformation, setUserInformation] = useState({ isReferralActivated: false }) as any;
    const [zip, setZIP] = useState(0);

    const { sendTransaction } = useSendTransaction();

    useEffect(() => {
        // console.log("address", address)
        if (address) {
            initialCallForGetData();
        } else {
            // to do prompt message for user not found
            router.replace("/");
        }

    }, [address]);

    const initialCallForGetData = () => {
        setLoading(true);
        initialContract(address);
        checkUserExists(address);
        getUserPoints();
    }

    const checkUserExists = async (userAddress: string) => {
        const userDetail: any = await getUserDetail(userAddress);
        // console.log("user detail", userDetail)
        if (![undefined, null, ""].includes(userDetail.email)) {
            setUserInformation(userDetail);
            getProgressBarDetail();
            getReferralCount();
            setLoading(false)
        } else {
            // to do prompt message for user not found
            router.replace("/");
        }
    }

    const getReferralCount = async () => {
        setLoading(true);

        const referralCount = await getReferralCountByAddress(address);
        setReferralCountDetail(referralCount);

        const referralCodeResponse = await getReferralCodeByAddress(address);
        setGenReferralCode(referralCodeResponse);

        setLoading(false);
    }

    const getProgressBarDetail = async () => {
        const rewardData = await getRewardDetailAndLimit(address) as object;
        const totalUserDetail = await getTotalUserAndLimit() as object;
        const referralReward = await getReferralGenerateReward() as number;
        setProgressBarDetail({ ...rewardData, ...totalUserDetail, referralReward });
    }

    const generateReferralCode = async () => {

        setLoadingMessage("");
        if (["", undefined, null].includes(referralCode)) {
            showAlert({
                kind: Alert_Kind__Enum_Type.ERROR,
                message: t(i18n)`Enter referral code`,
            });
        } else if (parseInt(referralCode.toString()[0]) === 0) {
            showAlert({
                kind: Alert_Kind__Enum_Type.ERROR,
                message: t(i18n)`Referral code cannot start with 0.`,
            });
        } else if (!/^\d{10}/.test(referralCode)) {
            showAlert({
                kind: Alert_Kind__Enum_Type.ERROR,
                message: t(i18n)`Enter a valid referral code.`,
            });
        } else {
            setLoading(true);
            setLoadingMessage("Please wait while we are validating yout referral code.");
            const validReferralCode = await checkReferralCodeExists(referralCode, true);

            if (validReferralCode === "0x0000000000000000000000000000000000000000") {

                // console.log("currentChainId", currentChainId, rpcChainId)
                setLoadingMessage("Please confirm the transaction request.");
                const { success = false, transactionObj = {}, error } = await generateReferralCodeByAddress(referralCode, true) as any;
                if (success && transactionObj) {
                    sendTransaction(transactionObj, {
                        onSuccess: (tx) => {
                            onSuccessTransaction({ hash: tx });
                        },
                        onError: (error) => {
                            onFailedTransaction(error);
                        }
                    });
                    return true;
                } else if (error) {
                    onFailedTransaction(error);
                } else {
                    showAlert({
                        kind: Alert_Kind__Enum_Type.ERROR,
                        message: t(i18n)`Sorry, Something went wrong, Please try again later.`,
                    });
                }
                /* const genRefRes = await generateReferralCodeByAddress(referralCode);
                if (genRefRes === 1) {
                    showAlert({
                        kind: Alert_Kind__Enum_Type.SUCCESS,
                        message: t(i18n)`Success! Referral Code activated successfully.`,
                    });
                    checkUserAlreadyInWaitlist(true);
                } else if (genRefRes === 2) {
                    showAlert({
                        kind: Alert_Kind__Enum_Type.ERROR,
                        message: t(i18n)`Failed to generate referral code, Please try again later.`,
                    });
                } else if (genRefRes === 9) {
                    showAlert({
                        kind: Alert_Kind__Enum_Type.ERROR,
                        message: t(i18n)`Sorry, Something went wrong, Please try again later.`,
                    });
                } */

            } else if (validReferralCode !== 9) {
                showAlert({
                    kind: Alert_Kind__Enum_Type.ERROR,
                    message: t(i18n)`Referral code already in use. Please use another referral code.`,
                });
            } else {
                showAlert({
                    kind: Alert_Kind__Enum_Type.ERROR,
                    message: t(i18n)`Failed to validate referral details. Please try again later.`,
                });
            }
        }
        setLoading(false);
    }

    const onSuccessTransaction = async (transactionObject = { hash: '' }) => {

        const { hash = '' } = transactionObject;
        if (![null, ""].includes(hash)) {
            setLoadingMessage("Please wait while we are validating your transaction detail.")
            const transactionStatus = await checkTransactionStatusByHash(hash);
            if (transactionStatus !== 9) {
                showAlert({
                    kind: Alert_Kind__Enum_Type.SUCCESS,
                    message: t(i18n)`Success! Referral Code activated successfully.`,
                });
                setUserInformation({ ...userInformation, isReferralActivated: true });
                initialCallForGetData();
            } else
                showAlert({
                    kind: Alert_Kind__Enum_Type.ERROR,
                    message: t(i18n)`Referral code generation failed or may not have been updated properly. Please try again later.`,
                });
        }
        setLoading(false);

    }

    const onFailedTransaction = async (errorFromTransaction: any) => {

        if (![undefined, null, ""].includes(errorFromTransaction)) {
            if (errorFromTransaction.toString().indexOf("User rejected the request") > -1) {
                showAlert({
                    kind: Alert_Kind__Enum_Type.ERROR,
                    message: t(i18n)`You have rejected the referral code generation request. Please re-initiate the transaction`,
                });
            } else if (errorFromTransaction.toString().toLowerCase().indexOf("insufficient") > -1) {
                showAlert({
                    kind: Alert_Kind__Enum_Type.ERROR,
                    message: t(i18n)`You have insufficient funds to make this transaction.`,
                });
            } else {
                showAlert({
                    kind: Alert_Kind__Enum_Type.ERROR,
                    message: t(i18n)`Sorry, Something went wrong, Please try again later.`,
                });
            }
        }
        setLoading(false);
    }

    const getUserPoints = async () => {
        const { data = [], } = await callPostAPI("getTopRewardGainer", { page: 1, limit: 50, orderBy: -1, address }, { Authorization: staticToken }) as any;
        if (Array.isArray(data) && data.length > 0) {
            setZIP(data[0].points);
        }
    }

    const { isReferralActivated = false } = userInformation;

    const { active = 0, inActive = 0 } = referralCountDetail;
    const { reward = 0, rewardLimit = 0, totalUser = 0, totalUserLimit = 0, referralReward = 0, limit = 0, maxLimit = 0 } = progressBarDetail;
    // console.log("totalUser = 0, totalUserLimit ", totalUser, totalUserLimit)
    // console.log("referralReward", referralReward)
    return (
        <div className='landingmain'>
            {loading && <Loader message={loadingMessage} />}
            <div className='progressheadcard'>
                <Row>
                    <Col md={12} lg={4} xl={6}>
                        <div className='progresstitle'>
                            <Row>
                                <Col md={2} xs={3}>
                                    <label htmlFor="file"><Trans>User</Trans></label>
                                </Col>
                                <Col md={10} xs={9}>
                                    <div className="progress" id="file" >
                                        <div
                                            className="progress-bar"
                                            role="progressbar"
                                            aria-valuenow={70}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            style={{ width: ((totalUser / totalUserLimit) * 100) < 1 ? "1%" : parseFloat(((totalUser / totalUserLimit) * 100).toFixed(2)) + "%" }}
                                        >
                                        </div>
                                        <span className='progressamout'>{totalUser} / {totalUserLimit}</span>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                    <Col md={12} lg={8} xl={6}>
                        <div className='progresstitle'>
                            <Row>
                                <Col md={3} xs={3}>
                                    <label htmlFor="file" className='ml-5'><Trans>Potential earning</Trans></label>
                                </Col>
                                <Col md={9} xs={9}>
                                    <div className="progress" id="file" >
                                        <div
                                            className="progress-bar"
                                            role="progressbar"
                                            aria-valuenow={70}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            style={{ width: ((reward / rewardLimit) * 100) < 1 ? "0%" : parseFloat(((reward / rewardLimit) * 100).toFixed(2)) + "%" }}
                                        >
                                        </div>
                                        <span className='progressamout'>{reward} / {rewardLimit} </span>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>

            <Row>
                <Col md={12} lg={4} xl={6}>
                    <div className='referralscard'>
                        <Row>
                            <Col md={12}>
                                <div className='referrals'>
                                    <span><Trans>Referrals</Trans></span>
                                </div>
                            </Col>
                            <Col md={12} lg={12} xl={4}>
                                <div className='activeinactive'>
                                    <span><Trans>Active Referrals</Trans></span>
                                    <span><Trans>Inactive Referrals</Trans></span>
                                </div>
                            </Col>
                            <Col md={12} lg={12} xl={8}>
                                <div className='refegraph'>
                                    {(active + inActive) <= 0 && <img className='img-fluid' src={"/images/landingpage/Emptygraph.svg"} alt='Zeebu' title='Zeebu' />}
                                    {(active + inActive) > 0 && <PieChart {...referralCountDetail} />}
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <div className='referralscard'>
                        <div className={!isReferralActivated ? 'refcodeinactive' : 'refcodeactive'}>
                            <Row>
                                <Col md={12}>
                                    <div className='referrals'>
                                        <span><Trans>Share Referral Code</Trans></span>
                                        <p><Trans>Invite anyone to be part of the ecosystem</Trans></p>
                                    </div>
                                </Col>
                                <Col md={12}>
                                    <form className='refinputcode'>
                                        <input type="text" value={genReferralCode} disabled={true} />
                                        <ContentCopy fontSize="small" className='copyicon' onClick={() => genReferralCode !== "" ? onCopyText(genReferralCode, showAlert({
                                            kind: Alert_Kind__Enum_Type.INFO,
                                            message: t(i18n)`Copied.`,
                                        })) : {}} />
                                        <RWebShare
                                            data={genReferralCode === "" ? {} : {
                                                text: genReferralCode,
                                                url: window.location.origin + "?referralCode=" + genReferralCode,
                                                title: "Zeebu",
                                            }}
                                            onClick={() => console.log("shared successfully!")}
                                        >
                                            <button type="button" disabled={genReferralCode === ""}><ShareIcon fontSize="small" /><Trans>Share</Trans></button>
                                        </RWebShare>
                                    </form>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>
                <Col md={12} lg={8} xl={6}>
                    <div className="usercardslidbox">
                        <div className='progresstitle potentialtitle'>
                            <Row>
                                <Col md={4} xs={5}>
                                    <label htmlFor="file"><Trans>My ZIP</Trans></label>
                                </Col>
                                <Col md={8} xs={7}>
                                    <span className='float-right'>{zip}</span>
                                </Col>
                            </Row>
                        </div>

                        <div className='invitationcode'>
                            <div className='invitationtitle'>
                                <Row>
                                    <Col md={2} xs={2}>
                                        <img src={"/images/landingpage/InvitationcodeActive.svg"} alt='' title='' />
                                    </Col>
                                    <Col md={8} xs={8}>
                                        <div className='invsubtitle'>
                                            <span>{!isReferralActivated ? "Activate" : ""} <Trans>Your Referral Code</Trans></span>
                                            <p><Trans>Enter your desired 10 digit code to activate referral</Trans></p>
                                        </div>
                                    </Col>
                                    <Col md={2} xs={2} className='text-center'><Link className='referralamount active' to="/">{referralReward} <Trans>ZIP</Trans></Link></Col>
                                </Row>
                            </div>
                            <div className='invitationinput'>
                                <Row>
                                    <Col md={isReferralActivated ? 12 : 9}>
                                        <OtpInput
                                            value={genReferralCode !== "" ? genReferralCode : referralCode}
                                            onChange={setReferralCode}
                                            numInputs={10}
                                            renderSeparator={<></>}
                                            renderInput={(props) => <input {...props} disabled={isReferralActivated || loading} />}
                                            inputType="tel"
                                        />
                                    </Col>
                                    {!isReferralActivated && <Col md={3}>
                                        <button disabled={loading} onClick={() => loading ? {} : generateReferralCode()} className='commanbtn' type="button"><Trans>Submit</Trans> {loading && <span className="fa fa-spinner fa-pulse fa-lg ml-5 fa-spin" />}</button>
                                    </Col>}
                                </Row>
                            </div>
                        </div>

                        <div className='invitationcode'>
                            <div className='invitationtitle'>
                                <Row>
                                    <Col md={2} xs={2}>
                                        <img src={"/images/landingpage/RewardActive.svg"} alt='' title='' />
                                    </Col>
                                    <Col md={7} xs={10}>
                                        <div className='invsubtitle'>
                                            <span><Trans>Participate in Galxe campaign </Trans></span>
                                            <p><Trans>Earn ZBU rewards by performing simple tasks on the go.</Trans></p>
                                        </div>
                                    </Col>
                                    <Col md={3} xs={12}>
                                        <div className='conbtn active'>
                                            <Link to={galxeRedirectLink} target='_blank'><Trans>Galxe campaign</Trans></Link>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        <div className='invitationcode'>
                            <div className='invitationtitle'>
                                <Row>
                                    <Col md={2} xs={2}>
                                        <img src={"/images/landingpage/LockThreeActiveLock.svg"} alt='' title='' />
                                    </Col>
                                    <Col md={7} xs={10}>
                                        <div className='invsubtitle'>
                                            <span><Trans>Upcoming Reward Campaign </Trans></span>
                                            <p><Trans>New reward task will be announced soon</Trans></p>
                                        </div>
                                    </Col>
                                    <Col md={3} xs={12}>
                                        <div className='conbtn active'>
                                            <Link to=""><Trans>Coming soon</Trans></Link>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    )
}
export default UserDashboard;