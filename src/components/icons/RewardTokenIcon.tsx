import type { SVGProps } from "react";
import { useTheme } from "@mui/material";

export default function RewardTokenIcon(props: SVGProps<SVGSVGElement>) {
  const theme = useTheme();

  return (
    <svg
      {...props}
      width={props.width ?? "24"}
      height={props.height ?? "24"}
      viewBox="0 0 24 24"
      fill="none"
      stroke={theme.palette.text.primary}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 8.2V15.8C3 16.5 3.4 17.2 4 17.5L11 21.4C11.6 21.7 12.3 21.7 12.9 21.4L19.9 17.5C20.5 17.1 20.9 16.5 20.9 15.8V8.2C20.9 7.5 20.5 6.8 19.9 6.5L12.9 2.6C12.3 2.3 11.6 2.3 11 2.6L4 6.4C3.4 6.8 3 7.5 3 8.2Z"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
