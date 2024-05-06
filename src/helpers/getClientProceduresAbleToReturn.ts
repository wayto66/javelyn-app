const getClientProductsAbleToReturn = (clientData: any) => {
  const products: any[] = [];
  for (const ticket of clientData.tickets) {
    if (
      !ticket.statusAvailableToReturn ||
      ticket.productsAvailableToReturn.length < 1
    ) {
      continue;
    }

    for (const product of ticket.productsAvailableToReturn) {
      products.push(product);
    }
  }
  return products;
};
export default getClientProductsAbleToReturn;
