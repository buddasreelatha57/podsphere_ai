import "./AuthLayout.css";
import AnimatedBackground from "./AnimatedBackground";

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <>
      <AnimatedBackground />

      <div className="auth-page">
        <div className="auth-card">

          <h1>PodSphere AI</h1>

          <h2>{title}</h2>

          <p>{subtitle}</p>

          {children}

        </div>
      </div>
    </>
  );
}