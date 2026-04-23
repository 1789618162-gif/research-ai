export type ProductFeatureRow = {
  productName: string;
  coreFeatures: string[];
  users: string[];
  scenarios: string[];
  pricing: string;
};

type ProductFeatureTableProps = {
  products: ProductFeatureRow[];
  caption?: string;
};

const columns = ["产品名", "核心功能", "用户", "场景", "定价"];

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <span className="text-stone-400">-</span>;
  }

  return (
    <div className="flex min-w-0 flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="max-w-full rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium leading-5 text-stone-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function ProductFeatureTable({
  products,
  caption,
}: ProductFeatureTableProps) {
  if (products.length === 0) {
    return (
      <section className="rounded-md border border-stone-300 bg-white/70 p-6 text-center text-sm text-stone-500">
        暂无产品对比数据
      </section>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-stone-300 bg-white/80">
      <table className="min-w-[920px] w-full border-collapse text-left text-sm">
        {caption ? (
          <caption className="caption-top border-b border-stone-200 px-4 py-3 text-left text-base font-semibold text-stone-950">
            {caption}
          </caption>
        ) : null}
        <thead className="bg-stone-50 text-xs uppercase tracking-normal text-stone-500">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="border-b border-stone-200 px-4 py-3 font-semibold"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {products.map((product) => (
            <tr key={product.productName} className="align-top">
              <th
                scope="row"
                className="w-[180px] px-4 py-4 text-base font-semibold text-stone-950"
              >
                {product.productName}
              </th>
              <td className="w-[240px] px-4 py-4">
                <TagList items={product.coreFeatures} />
              </td>
              <td className="w-[200px] px-4 py-4">
                <TagList items={product.users} />
              </td>
              <td className="w-[240px] px-4 py-4">
                <TagList items={product.scenarios} />
              </td>
              <td className="w-[180px] px-4 py-4 leading-6 text-stone-700">
                {product.pricing || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
