import { cn } from "@/lib/utils";

export const Connector = ({
  className,
  color = "#e5e2dd",
  ...props
}: React.SVGProps<SVGSVGElement> & { color?: string }) => {
  return (
    <svg
      fill="none"
      height="21"
      viewBox="0 0 22 21"
      width="22"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cn(
        "pointer-events-none absolute",
        className,
      )}
    >
      <path
        d="M10.5 4C10.5 7.31371 7.81371 10 4.5 10H0.5V11H4.5C7.81371 11 10.5 13.6863 10.5 17V21H11.5V17C11.5 13.6863 14.1863 11 17.5 11H21.5V10H17.5C14.1863 10 11.5 7.31371 11.5 4V0H10.5V4Z"
        fill={color}
      />
    </svg>
  );
};

export const CurvyCorner = ({
  position,
  className,
  color = "#e5e2dd",
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
  color?: string;
}) => {
  const rotations = {
    "top-left": "-rotate-90",
    "top-right": "",
    "bottom-left": "rotate-180",
    "bottom-right": "rotate-90",
  };

  const positions = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  };

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(
        "absolute pointer-events-none",
        positions[position],
        rotations[position],
        className
      )}
    >
      <path
        d="M0 0V8C0 16.8366 7.16344 24 16 24H24"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
