import { signIn } from "next-auth/react";

const SignInApi = async ({ req, res }: any) => {
  try {
    await signIn("credentials", {
      redirect: false,
      username: req.body.username,
      password: req.body.password,
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export default SignInApi;
