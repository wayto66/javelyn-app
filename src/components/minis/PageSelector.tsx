import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { ChangeEvent, Dispatch, MouseEvent, SetStateAction } from "react";

type TPageSelectDisplayParams = {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  pageSize: number;
  setPageSize: Dispatch<SetStateAction<number>>;
  totalCount: number;
};

export const PageSelectDisplay = ({
  page,
  setPage,
  setPageSize,
  pageSize,
  totalCount,
}: TPageSelectDisplayParams) => {
  const router = useRouter();
  const handlePageChange = (page: string | number) => {
    setPage(Number(page));
    router.push(router.route, {
      query: {
        ...router.query,
        page: page,
      },
    });
  };
  const handleNextPage = () => {
    if (pageSize * page < (totalCount ?? 0)) handlePageChange(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) handlePageChange(page - 1);
  };

  const pageSizeChange = (e: ChangeEvent) => {
    const value = (e.target as HTMLSelectElement).value;
    setPageSize(Number(value));
  };

  const pageSelectItem = (value: string, unselectable?: boolean) => {
    return (
      <button
        className={`select-none rounded-md ${
          page === Number(value) ? "bg-jpurple text-white" : "bg-gray-300"
        } w-[50px] px-4 py-1 font-semibold`}
        onClick={unselectable ? () => {} : () => handlePageChange(value)}
        key={`page-select-item-${value}`}
      >
        {value}
      </button>
    );
  };

  const pages: JSX.Element[] = [];
  const lastPageIndex = Math.ceil((totalCount ?? 0) / pageSize);

  if (page > 1 && (totalCount ?? 0) > pageSize * 4) {
    pages.push(pageSelectItem("1"));

    if ((totalCount ?? 0) > pageSize * 3 && page === lastPageIndex) {
      pages.push(pageSelectItem((page - 3).toString()));
    }

    if (lastPageIndex - page <= 1) {
      pages.push(pageSelectItem((page - 2).toString()));
    }

    if (lastPageIndex - page <= 2) {
      pages.push(pageSelectItem((page - 1).toString()));
    }

    if (page !== lastPageIndex) pages.push(pageSelectItem(page.toString()));
    if ((totalCount ?? 0) > pageSize * page)
      pages.push(pageSelectItem((page + 1).toString()));

    if ((totalCount ?? 0) > pageSize * (page + 2)) {
      if ((totalCount ?? 0) > pageSize * (page + 3)) {
        pages.push(pageSelectItem("...", true));
      } else {
        pages.push(pageSelectItem((page + 2).toString()));
      }
    }

    if ((totalCount ?? 0) > pageSize * 3 && page !== lastPageIndex - 1) {
      pages.push(pageSelectItem(lastPageIndex.toString()));
    }
  } else {
    pages.push(pageSelectItem("1"));
    if ((totalCount ?? 0) > pageSize) pages.push(pageSelectItem("2"));
    if ((totalCount ?? 0) > pageSize * 2) pages.push(pageSelectItem("3"));
    if ((totalCount ?? 0) > pageSize * 4)
      pages.push(pageSelectItem("...", true));

    if ((totalCount ?? 0) > pageSize * 3) {
      const lastPageIndex = Math.ceil((totalCount ?? 0) / pageSize);
      pages.push(pageSelectItem(lastPageIndex.toString()));
    }
  }

  return (
    <div className="mt-4 flex flex-row items-center justify-between gap-6">
      <select
        onChange={pageSizeChange}
        value={pageSize}
        className="rounded-md px-2 py-1 shadow-lg"
      >
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
        <option value={250}>250</option>
        <option value={1000}>1000</option>
        <option value={4000}>4000</option>
      </select>
      {totalCount > 0 && (
        <span>
          Exibindo {1 + (page - 1) * pageSize}-
          {Math.min(page * pageSize, totalCount ?? 0)} de {totalCount ?? 0}{" "}
          resultados
        </span>
      )}
      <div className="ml-auto flex flex-row items-center gap-3">
        <IconChevronLeft
          className="cursor-pointer select-none transition hover:bg-gray-200 "
          onClick={handlePreviousPage}
        />
        {pages}
        <IconChevronRight
          className="cursor-pointer select-none transition hover:bg-gray-200 "
          onClick={handleNextPage}
        />
      </div>
    </div>
  );
};
