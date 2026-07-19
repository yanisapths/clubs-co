interface Props {
  children: React.ReactNode;
}

export const metadata = {
  title: "Discover Clubs | Meeteon",
  description: "Explore clubs, find your spacees.",
};

export default async function Layout({ children }: Props) {
  return <div>{children}</div>;
}
