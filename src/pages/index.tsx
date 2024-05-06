import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

const MainPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push("/dashboard");
    else router.push("/login");
  });

  return <div className=""></div>;
};

export default MainPage;
