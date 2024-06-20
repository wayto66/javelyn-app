// pages/api/hmac.ts

import * as crypto from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

export default (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", [
        "https://javelyn.vercel.app",
        "https://javelyn.com.br",
      ]);
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Max-Age", "86400"); // Cache a resposta por 1 dia
      res.status(204).end();
      return;
    }
    const { body } = req;
    const secret = process.env.HMAC_SECRET as string;

    if (!secret || secret.length === 0) {
      return res.status(500).json({ error: "HMAC_SECRET is not defined" });
    }

    const operation = body.query ?? body.mutation;

    const operationString = JSON.stringify(operation)
      .replace(/\\n/g, "") // Remove \n (novas linhas)
      .replace(/\\t/g, "") // Remove \t (tabulações)
      .replace(/\s+/g, "") // Remove todos os espaços em branco
      .replace(/,/g, "");

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(operationString);
    const signature = hmac.digest("hex");

    res.setHeader("Access-Control-Allow-Origin", [
      "https://javelyn.vercel.app",
      "https://javelyn.com.br",
    ]);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    return res.status(200).json({ signature, body });
  } catch (err: any) {
    return res.status(500).json({ err });
  }
};
