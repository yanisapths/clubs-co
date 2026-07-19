interface Props {
  children: React.ReactNode;
}

export const metadata = {
  title: "Login | Meeteon",
  description: "Welcome to your home on Meeteon.",
};

export default async function LoginLayout({ children }: Props) {
  return <div>{children}</div>;
}
