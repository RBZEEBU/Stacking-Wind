import type { SVGProps } from "react";
import { useTheme } from "@mui/material";

export default function DisconnectIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M15.0996 7.55999C14.7896 3.95999 12.9396 2.48999 8.88961 2.48999H8.75961C4.28961 2.48999 2.49961 4.27999 2.49961 8.74999V15.27C2.49961 19.74 4.28961 21.53 8.75961 21.53H8.88961C12.9096 21.53 14.7596 20.08 15.0896 16.54"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.99988 12H20.3799"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.15 8.65002L21.5 12L18.15 15.35"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
