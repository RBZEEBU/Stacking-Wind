import React, { useState, Fragment, useContext, useEffect } from 'react';
import { Row, Col, Modal, ModalHeader, ModalBody, NavLink as Link } from 'reactstrap';
import OtpInput from 'react-otp-input';
// import { HashLink as Link } from 'react-router-hash-link';
// import { Avatar } from "@mui/material"
// import UserContextAPI from './../UserContextAPI';
// import { toast } from 'react-toastify';
import { minZBUBalance, minNativeCurrencyBalance, delay, rpcSymbol } from "@/consts";
import { useSendTransaction, useAccount } from 'wagmi'
import Loader from "@/components/Loader";
import { checkReferralCodeExists, registerToWaitlist, getZBUBalance, getNativeBalance, checkTransactionStatusByHash, getTotalUserAndLimit, initialContract } from "@/helper/commonUtils";
import { useRouter } from "next/navigation";
import CheckIcon from '@mui/icons-material/Check';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import CircleIcon from '@mui/icons-material/Circle';
import { AlertsContext } from "@/contexts/Alerts";
import { useLingui } from "@lingui/react";
import { Alert_Kind__Enum_Type } from "@/types";
import { t, Trans } from "@lingui/macro";

let globalAddress: string = '';
function RegistrationForm() {

    const { showAlert } = useContext(AlertsContext);
    const { i18n } = useLingui();

    const { address: Address = '' } = useAccount();
    globalAddress = Address || '';

    // console.log("registration Address", Address)
    const router = useRouter();
    const [referralCode, setReferralCode] = useState('');
    const [referralParentAddress, setReferralParentAddress] = useState('');
    const [lastStep, setLastStep] = useState(false);
    const [email, setEmail] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    const { sendTransaction } = useSendTransaction();

    useEffect(() => {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const refCode = params.get("referralCode");
        if (refCode !== null)
            validateReferralCode(refCode);

        if (Address) {
            initialContract(Address);
        }

    }, [Address]);

    const validateReferralCode = async (refCode: string, isPressButton = false) => {
        if (isPressButton && refCode.toString().length !== 10) {
            showAlert({
                kind: Alert_Kind__Enum_Type.ERROR,
                message: t(i18n)`Please enter the referral code.`,
            });
            return false;
        }

        setReferralCode(refCode);
        if (isPressButton) {
            setLoading(true);
            setLoadingMessage("Please wait while we validate your referral code.");
            // console.log("Address", Address)
            const isValidReferral = await checkReferralCodeExists(refCode, Address === '');
            if (isValidReferral !== 9) {
                if (isValidReferral === "0x0000000000000000000000000000000000000000") {
                    showAlert({
                        kind: Alert_Kind__Enum_Type.ERROR,
                        message: t(i18n)`Invalid referral code. Please use another referral code.`,
                    });
                    setReferralParentAddress("0x0");
                } else {
                    setReferralParentAddress(isValidReferral);
                    const element: any = document.getElementById("email");
                    element.focus()
                }
            } else {
                showAlert({
                    kind: Alert_Kind__Enum_Type.ERROR,
                    message: t(i18n)`Failed to validate referral details. Please try again later.`,
                });
            }
            setLoading(false);
        }
    }

    const validateEmail = () => {
        if (email === '') {
            showAlert({
                kind: Alert_Kind__Enum_Type.ERROR,
                message: t(i18n)`Please enter an email`,
            });
        } else if (!/^[\w%+.-]+@[\d.A-Za-z-]+\.[A-Za-z]{2,}$/.test(email)) {
            showAlert({
                kind: Alert_Kind__Enum_Type.ERROR,
                message: t(i18n)`Please enter a valid email`,
            });
        } else {
            setLastStep(true);
        }
    }

    const doRegistration = async () => {

        setLoadingMessage("");
        if (referralCode !== '' && referralParentAddress !== '' && email !== '') {

            // connectWallet();
            // await delay(1000);
            // console.log("Address call", Address)
            if (['', "", undefined].includes(globalAddress)) {
                const walletButton: any = document.getElementById("connectWalletButton");
                walletButton.click();
                return false;
            }

            setLoading(true);
            // setLoadingMessage("Please select wallet.");
            let response = { foundRecord: 0, connectedAddress: globalAddress };
            if (globalAddress !== "") {
                response = { connectedAddress: globalAddress, foundRecord: 1 };
            } /* else {
                connectWallet();
                await delay(1000);
                response = await ConnectMetamask(true);
            } */

            // console.log("response", response)
            const { connectedAddress = "", foundRecord = 0 } = response;
            // console.log("connectedAddress foundRecord = 0 ", connectedAddress, foundRecord)
            if (foundRecord === 1 && connectedAddress !== "") {

                // setLoading(true);
                setLoadingMessage("Please wait while we validate your balance details.");

                const limitResponse: any = getTotalUserAndLimit(true);
                if (limitResponse === 9) {
                    showAlert({
                        kind: Alert_Kind__Enum_Type.ERROR,
                        message: t(i18n)`Failed to get registration limit. Please try again later.`,
                    });
                    setLoading(false);
                    return false;
                } else if (!limitResponse) {
                    setOpenModal(true);
                    setLoading(false);
                    return false;
                }

                const zbuBal: any = await getZBUBalance(connectedAddress);
                const nativeBal: any = await getNativeBalance(connectedAddress);
                // console.log("zbuBal", parseFloat(nativeBal), minNativeCurrencyBalance, parseFloat(nativeBal) < minNativeCurrencyBalance);
                if (parseFloat(zbuBal) >= minZBUBalance && parseFloat(nativeBal) >= minNativeCurrencyBalance) {

                    setLoadingMessage("Please confirm the transaction request.");
                    const { success = false, transactionObj = {}, error } = await registerToWaitlist(referralParentAddress, email, true);
                    if (success && transactionObj) {
                        sendTransaction(transactionObj, {
                            onSuccess: (data) => {
                                // console.log('Transaction Hash:', data);
                                onSuccessTransaction({ hash: data });
                                // Handle success, e.g., show a success message to the user
                            },
                            onError: (error) => {
                                onFailedTransaction(error);
                            }
                        });
                        return true;
                    } else if (error) {
                        onFailedTransaction(error);
                        return false;
                    } else {
                        showAlert({
                            kind: Alert_Kind__Enum_Type.ERROR,
                            message: t(i18n)`Failed to register. Please try again later.`,
                        });
                        return false;
                    }

                } else if (parseFloat(zbuBal) < minZBUBalance) {
                    // closeDialog();
                    showAlert({
                        kind: Alert_Kind__Enum_Type.ERROR,
                        message: t(i18n)`Insufficient balance in Zeebu, Minimum ${minZBUBalance} + " required.`,
                    });
                } else if (parseFloat(nativeBal) < minNativeCurrencyBalance) {
                    // closeDialog();
                    showAlert({
                        kind: Alert_Kind__Enum_Type.ERROR,
                        message: t(i18n)`Insufficient balance in ${rpcSymbol}, Minimum ${minNativeCurrencyBalance} + " required.`,
                    });
                } else {
                    showAlert({
                        kind: Alert_Kind__Enum_Type.ERROR,
                        message: t(i18n)`Failed to validate your balance details.`,
                    });
                }

                /* if (!Address)
                    modalDisconnect(); */

            } else if (foundRecord === 2) {
                showAlert({
                    kind: Alert_Kind__Enum_Type.ERROR,
                    message: t(i18n)`Wallet address already used, Please use another wallet address to continue.`,
                });
            } else if (foundRecord === 3) {
                showAlert({
                    kind: Alert_Kind__Enum_Type.ERROR,
                    message: t(i18n)`Please connect your wallet to continue.`,
                });
            } if (foundRecord === 4) {
                showAlert({
                    kind: Alert_Kind__Enum_Type.ERROR,
                    message: t(i18n)`Failed to switch network, Please change network manually.`,
                });
            } else {
                // console.log("run here demo");
                showAlert({
                    kind: Alert_Kind__Enum_Type.ERROR,
                    message: t(i18n)`Sorry, Something went wrong, Please try again later.`,
                });
            }

            setLoading(false);

        } else {
            // console.log("run here demo again");
            showAlert({
                kind: Alert_Kind__Enum_Type.ERROR,
                message: t(i18n)`Sorry, Something went wrong, Please try again later.`,
            });
        }

    }

    const onSuccessTransaction = async (transactionObject = { hash: '' }) => {

        const { hash = '' } = transactionObject;
        if (typeof transactionObject === "object" && ![null, ""].includes(hash)) {
            setLoadingMessage("Please wait while we validate your transaction details.");
            const transactionStatus = await checkTransactionStatusByHash(hash);
            if (transactionStatus !== 9) {
                showAlert({
                    kind: Alert_Kind__Enum_Type.SUCCESS,
                    message: t(i18n)`Success! You're all set. Heading to the Waitlist Dashboard now.`,
                });
                // checkUserAlreadyInWaitlist(true);
                router.replace("/dashboard");
                setLoading(false);
                return true;
            } else
                showAlert({
                    kind: Alert_Kind__Enum_Type.ERROR,
                    message: t(i18n)`Transaction failed or may not have been updated properly. Please try again later.`,
                });
            return 1;
        }
        setLoading(false);

    }

    const onFailedTransaction = async (errorFromTransaction: any) => {

        if (![undefined, null, ""].includes(errorFromTransaction)) {
            if (errorFromTransaction.toString().indexOf("User rejected the request") > -1) {
                showAlert({
                    kind: Alert_Kind__Enum_Type.ERROR,
                    message: t(i18n)`You have rejected the transaction. Please re-initiate the transaction.`,
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

    const keyPress = (e: any) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            validateEmail();
        }
    }

    return (
        <Fragment>
            {loading && <Loader message={loadingMessage} />}
            <div className="cardslidbox">
                <div className={'' + (lastStep ? "sucessfulcard" : "")}>
                    <div className='invitationcode sucessone'>
                        <div className='invitationtitle'>
                            <Row>
                                <Col md={2} xs={2}>
                                    <CircleIcon fontSize='small' className='active' />
                                    <img src={"/images/landingpage/InvitationcodeActive.svg"} alt='' title='' />
                                </Col>
                                <Col md={10} xs={10}>
                                    <div className='invsubtitle'>
                                        <span><Trans>Secret Code</Trans></span>
                                        <p><Trans>Enter your secret code to gain early access</Trans></p>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        <div className='invitationinput'>
                            <Row>
                                <Col md={9}>
                                    <OtpInput
                                        value={referralCode}
                                        onChange={validateReferralCode}
                                        numInputs={10}
                                        renderSeparator={<></>}
                                        inputType="tel"
                                        renderInput={(props) => <input {...props} />}
                                    />
                                </Col>
                                <Col md={3}>
                                    <div className='invbutton'>
                                        <Link className='previous inactive' onClick={e => setReferralCode('')}>
                                            <CheckIcon fontSize='small' sx={{ color: 'white' }} />
                                            {/* <i className={"fas fa-times"} aria-hidden="true"></i> */}
                                        </Link>
                                        <Link className='next' onClick={() => validateReferralCode(referralCode, true)}>
                                            <KeyboardDoubleArrowRightIcon fontSize='small' sx={{ color: 'white' }} />
                                            {/* <i className="fas fa-angle-double-right" aria-hidden="true"></i> */}
                                        </Link>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    <div className='downarrow'>
                        <img src={"/images/landingpage/Downarrow.svg"} alt='' title='' />
                    </div>

                    <div className={`${!["0x0", ""].includes(referralParentAddress) ? 'emailcode' : 'referlemail'}`}>
                        <div id="movingBox" className={`invitationcode invitationuser`}>
                            <div className='invitationtitle'>
                                <Row>
                                    <Col md={2} xs={2}>
                                        <CircleIcon fontSize='small' />
                                        <img src={"/images/landingpage/EmailActive.svg"} alt='' title='' />
                                    </Col>
                                    <Col md={10} xs={10}>
                                        <div className='invsubtitle'>
                                            <span><Trans>Email</Trans></span>
                                            <p><Trans>Enter your email address to stay updated on our progress and enjoy exclusive benefits!</Trans></p>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <div className='invitationinput'>
                                <div className='emailform'>
                                    <form action="#">
                                        <Row>
                                            <Col md={9} xs={12}>
                                                <input type="email" id="email" placeholder='Your Email' name="email" value={email} maxLength={70} onChange={e => setEmail(e.target.value)} onKeyDown={keyPress} />
                                            </Col>
                                            <Col md={3} xs={5}>
                                                <input type="button" value="Submit" disabled={loading} onClick={validateEmail} />
                                            </Col>
                                        </Row>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className='downarrow'>
                            <img src={"/images/landingpage/Downarrow.svg"} alt='' title='' />
                        </div>
                    </div>
                </div>
                <div className={'invitationcode conwallet ' + (lastStep ? "activesignwallet" : "")}>
                    <div className='invitationtitle'>
                        <Row>
                            <Col md={2} xs={2}>
                                <CircleIcon fontSize='small' />
                                <img src={"/images/landingpage/WalletsActive.svg"} alt='' title='' />
                            </Col>
                            <Col md={10} xs={10}>
                                <div className='invsubtitle'>
                                    <span><Trans>Connect Wallets</Trans></span>
                                    <p><Trans>Connect your wallet now to secure your waitlist spot and be first to claim exclusive rewards</Trans></p>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div className={'conbtn ' + (lastStep ? "active" : "")} onClick={lastStep ? (loading ? () => { } : doRegistration) : () => { }}>
                        <Link ><i className="fa fa-wallet" />{Address === "" ? 'Connect Wallet' : 'Validate Wallet'} {loading && <span className="fa fa-spinner fa-pulse fa-lg ml-5 fa-spin" />}</Link>
                    </div>
                </div>
            </div>
            <Modal isOpen={openModal} toggle={() => loading ? {} : setOpenModal(false)} className='planpopup'>
                <ModalHeader>
                    <Trans>Thank you for your interest!</Trans>
                </ModalHeader>
                <ModalBody>
                    <Trans>We have reached our maximum capacity for registrations at this time.</Trans>
                    <Trans>Please stay tuned for future opportunities, and don&apos;t hesitate to join our waiting list if you would like to be notified when more spots become available.</Trans>
                    <Trans>We appreciate your understanding and look forward to welcoming more participants soon.</Trans>
                </ModalBody>
            </Modal>
        </Fragment>
    );
}

export default RegistrationForm;
