import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import CustomBreadcrumbs from "@/components/Breadcrumbs";
import ClaimRewards from "@/components/ClaimRewards";
import Header from "@/components/Header";
import { mainTitle } from "@/consts";
import { withLinguiPage } from "@/app/withLingui";
import {Typography} from "@mui/material";
import { Trans } from "@lingui/macro";

export default withLinguiPage(function Page({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const { i18n } = useLingui();

  const title = t(i18n)`Claim Rewards`;

  const breadcrumbItems = [
    { href: "/", title: mainTitle },
    { href: "", title: title },
  ];

  return (
    <>
      <Header title={<Typography fontWeight="bold" fontSize="2.5rem" color="text.primary"><Trans>{title}</Trans></Typography>} >
        <CustomBreadcrumbs items={breadcrumbItems} />
      </Header>
      <ClaimRewards poolId={params.id} />
    </>
  );
});
