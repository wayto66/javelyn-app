async function getOccurrenceInArray(array: any[]) {
  const data: any[] = [];
  const set = new Set(array);

  await set.forEach(async (v) => {
    const count = await getOccurrence(array, v);
    data.push({
      element: v,
      count: count,
    });
  });

  return data;
}

async function getOccurrence(array: any, value: any) {
  var count = 0;
  array.forEach((v: any) => {
    if (v === value) count++;
  });
  return count;
}

export default getOccurrenceInArray;
