"use client";

import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from "reactstrap";
import Loader from "@/components/Loader";
import { callPostAPI, numberFormat } from '@/helper';
import { staticToken } from '@/consts';
import { getTotalUserAndLimit } from '@/helper/commonUtils';
import { useTheme } from '@mui/material/styles';
import { Trans } from "@lingui/macro";

const today = new Date();
const day = today.getDate().toString().padStart(2, '0');
const month = today.toLocaleString('en-US', { month: 'short' });
const year = today.getFullYear();

const formattedDate = `${day} ${month} ${year}`;
// console.log(formattedDate);

const Leaderboard = () => {

    const [loading, setLoading] = useState(true);
    const [leaderBoardData, setLeaderBoardData] = useState({
        topPerformerList: [], recentRegistrationList: [], totalRegister: 0, totalPoints: 0
    });

    useEffect(() => {
        getTopPerformer();
    }, []);

    const getTopPerformer = async () => {

        let leaderBoardDetail = { totalRegister: 0, totalPoints: 0 } as any;
        const { data: performerData = [], totalPoints } = await callPostAPI("getTopRewardGainer", { page: 1, limit: 50, orderBy: -1 }, { Authorization: staticToken }) as any;
        if (Array.isArray(performerData) && performerData.length > 0) {
            leaderBoardDetail.topPerformerList = performerData;
            leaderBoardDetail.totalPoints = totalPoints;
        }

        const { data = []/* , totalRecords = 0 */ } = await callPostAPI("getRecentRegistrationList", { page: 1, limit: 50, orderBy: -1 }, { Authorization: staticToken }) as any;
        if (Array.isArray(data) && data.length > 0) {
            leaderBoardDetail.recentRegistrationList = data;
            // leaderBoardDetail.totalRegister = totalRecords;
        }

        const { totalUser = 0 } = await getTotalUserAndLimit() as any;
        leaderBoardDetail.totalRegister = totalUser;
        if (totalUser > 0) {
            const element = document.getElementById("totalUsers") as any;
            element.innerHTML = totalUser;
        }

        setLeaderBoardData(leaderBoardDetail);
        setLoading(false);
    }

    const { topPerformerList = [], recentRegistrationList = [], totalRegister = 0, totalPoints = 0 } = leaderBoardData;

    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    return (
        <div className=''>
            {loading && <Loader />}
            <div className='stakingmain'>
                <div className='leaderboardmain'>
                    <Container>
                        <Row>
                            <Col md={9}>
                                <div className='leaderbox'>
                                    <Row>
                                        <Col md={7}>
                                            <div className='leadertitle'>
                                                <img src={"/images/new-image/ZeebuToken.svg"} alt="ZeebuToken" title="ZeebuToken" />
                                                <span><Trans>Leaderboard</Trans></span>
                                                <p><Trans>Last Updated</Trans> : {formattedDate}</p>
                                            </div>
                                        </Col>
                                        <Col md={5}>
                                            <div className='leadertokenright'>
                                                <div className='leadertoken'>
                                                    <div className='headbtn'>
                                                        <img src={isDarkMode ? '/images/new-image/Points.svg' : '/lightmode_images/points.svg'} />
                                                    </div>
                                                    <p><Trans>Total ZIP</Trans></p>
                                                    <span>{numberFormat(totalPoints, 0)}</span>
                                                </div>
                                                <div className='leadertoken'>
                                                    <div className='headbtn'>
                                                        <img src={isDarkMode ? '/images/new-image/user_icon.svg' : '/lightmode_images/users.svg'} alt="UserIcon" title='UserIcon' />
                                                    </div>
                                                    <p><Trans>Users</Trans></p>
                                                    <span>{totalRegister === 0 ? "--" : numberFormat(totalRegister, 0)}</span>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                                <div className='leaderboardlist table-responsive'>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th><Trans>Rank</Trans></th>
                                                <th><Trans>Name</Trans></th>
                                                <th><Trans>Invited By</Trans></th>
                                                <th><Trans>ZIP</Trans></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topPerformerList && topPerformerList.map((item, key) => {
                                                const { address = '', ref = '', points = 0 } = item;
                                                return <tr key={address}>
                                                    <td>{key + 1}</td>
                                                    <td>{address}</td>
                                                    <td>{ref}</td>
                                                    <td>{numberFormat(points, 0)}</td>
                                                </tr>
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Col>
                            <Col md={3} className='mar-20'>
                                <div className='leaderbox'>
                                    <div className='resentjoin'><Trans>Recent Joins</Trans></div>
                                </div>
                                <div className='leaderboardlist namelist'>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th><Trans>Address</Trans></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentRegistrationList && recentRegistrationList.map((item) => {
                                                const { address = '' } = item;
                                                return <tr key={"recent_" + address}><td>{address}</td></tr>
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        </div>
    )
}
export default Leaderboard;