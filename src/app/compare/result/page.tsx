import CompareResultPageClient from "@/components/compare/compare-result-page-client";

type CompareResultPageProps = {
  searchParams: Promise<{
    left?: string | string[];
    right?: string | string[];
  }>;
};

function getFirstSearchValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function CompareResultPage({
  searchParams,
}: CompareResultPageProps) {
  const params = await searchParams;

  return (
    <CompareResultPageClient
      initialLeftId={getFirstSearchValue(params.left) || undefined}
      initialRightId={getFirstSearchValue(params.right) || undefined}
    />
  );
}
