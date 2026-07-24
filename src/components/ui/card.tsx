import { type HTMLAttributes } from "react";
function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={`rounded-2xl bg-white ${className}`} {...props} />; }
function CardHeader({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={`p-5 ${className}`} {...props} />; }
function CardTitle({ className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) { return <h2 className={`text-base font-semibold text-slate-900 ${className}`} {...props} />; }
function CardContent({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={className} {...props} />; }
export { Card, CardHeader, CardTitle, CardContent };
