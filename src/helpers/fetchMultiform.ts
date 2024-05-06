type TParams = {
  path: string;
  formData: FormData;
  method: string;
};

const fetchMultiform = async (data: TParams): Promise<any> => {
  const headers = new Headers();
  headers.append("Secret", "therewasneveranyonebetter");

  try {
    const fetchData = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL + data.path,
      {
        method: data.method,
        headers,
        body: data.formData,
      }
    )
      .catch((err) => {
        console.log(err);
        return err;
      })
      .then((response) => response.json())
      .then(function (data) {
        return data;
      });
    return fetchData;
  } catch (error: any) {
    console.error(error.message);
  }
};

export default fetchMultiform;
