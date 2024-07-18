import { useTheme } from "@mui/material";
import type { SVGProps } from "react";

export default function NotificationsIcon(props: SVGProps<SVGSVGElement>) {
  const theme = useTheme();

  return (
    <svg
      {...props}
      width={props.width ?? "25"}
      height={props.height ?? "25"}
      viewBox="0 0 30 30"
      fill="none"
      stroke={theme.palette.text.primary}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.025 3.63745C10.8875 3.63745 7.52499 6.99995 7.52499 11.1375V14.75C7.52499 15.5125 7.19999 16.675 6.81249 17.325L5.37499 19.7125C4.48749 21.1875 5.09999 22.825 6.72499 23.375C12.1125 25.175 17.925 25.175 23.3125 23.375C24.825 22.875 25.4875 21.0875 24.6625 19.7125L23.225 17.325C22.85 16.675 22.525 15.5125 22.525 14.75V11.1375C22.525 7.01245 19.15 3.63745 15.025 3.63745Z"
        strokeWidth="1.875"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M17.3375 4.00005C16.95 3.88755 16.55 3.80005 16.1375 3.75005C14.9375 3.60005 13.7875 3.68755 12.7125 4.00005C13.075 3.07505 13.975 2.42505 15.025 2.42505C16.075 2.42505 16.975 3.07505 17.3375 4.00005Z"
        strokeWidth="1.875"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.775 23.825C18.775 25.8875 17.0875 27.575 15.025 27.575C14 27.575 13.05 27.15 12.375 26.475C11.7 25.8 11.275 24.85 11.275 23.825"
        strokeWidth="1.875"
        strokeMiterlimit="10"
      />
    </svg>
  );
}
