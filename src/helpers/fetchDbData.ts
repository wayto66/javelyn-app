type TParams = {
  path: string;
  data: any;
  method: string;
  retrying?: boolean;
};

type TJavelynResponse =
  | {
      meta: {
        status: number;
        message: string;
      };
      objects: any[] | null;
    }
  | undefined;

const fetchDbData = async (data: TParams): Promise<any> => {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL + data.path,
      {
        method: data.method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Secret: "therewasneveranyonebetter",
        },
        body: JSON.stringify(data.data),
      }
    );

    if (!response?.ok) {
      if (data.retrying) return null;
      console.error("No response, retrying");
      await new Promise((resolve) => {
        setTimeout(() => resolve(1), 500);
      });
      return fetchDbData({ ...data, retrying: true });
    }

    const dbData = await response.json();

    return dbData;
  } catch (error: any) {
    console.error("Fetch error, retrying");
    if (data.retrying) return null;
    await new Promise((resolve) => {
      setTimeout(() => resolve(1), 500);
    });
    return fetchDbData({ ...data, retrying: true });
  }
};

export default fetchDbData;
